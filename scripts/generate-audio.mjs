#!/usr/bin/env node
/**
 * 生成课文 TTS 音频并校准时间戳
 *
 * 工作流程：
 * 1. 从数据库读取所有课文及其句子（按 sortOrder 排序）
 * 2. 逐句用 espeak-ng 生成英文语音 wav
 * 3. 测量每句实际时长，拼接成完整课文 mp3
 * 4. 用真实时长更新数据库 Sentence 的 startTime/endTime 和 Lesson 的 duration
 *
 * 依赖：espeak-ng、ffmpeg（系统命令）；@prisma/client
 * 运行：node scripts/generate-audio.mjs
 *
 * 这样生成的音频时间戳与播放完全对齐，同步高亮效果真实可演示。
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const audioDir = join(projectRoot, "public", "audio");

const prisma = new PrismaClient();

/** 调用系统命令 */
function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "buffer", stdio: ["ignore", "pipe", "pipe"], ...opts });
}

/** 获取音频文件时长（秒） */
function getDuration(filePath) {
  try {
    const out = run("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", filePath,
    ]).toString().trim();
    return parseFloat(out) || 0;
  } catch {
    return 0;
  }
}

/** 用 espeak-ng 生成单句英文语音 wav，返回文件路径和时长 */
function synthesize(text, idx, lessonTempDir) {
  // 句间插入 0.4s 静音间隙
  const outPath = join(lessonTempDir, `s${idx}.wav`);
  // -s 130 稍慢语速适合小学生；-g 8 词间停顿
  run("espeak-ng", [
    "-v", "en-us", "-s", "120", "-g", "8",
    "-w", outPath,
    text,
  ]);
  const dur = getDuration(outPath);
  return { outPath, duration: dur };
}

/** 拼接多段 wav + 句间静音 → 最终 mp3 */
function concatToMp3(clips, gapSec, destMp3) {
  // 构造 concat 列表，每句后插静音
  const listPath = destMp3 + ".list.txt";
  const lines = [];
  const silencePath = destMp3 + ".silence.wav";
  // 生成 gapSec 秒静音 wav
  run("ffmpeg", ["-y", "-f", "lavfi", "-i", `anullsrc=r=22050:cl=mono`, "-t", String(gapSec), silencePath],
    { stdio: "ignore" });

  clips.forEach((c) => {
    lines.push(`file '${c.outPath}'`);
    lines.push(`file '${silencePath}'`);
  });
  writeFileSync(listPath, lines.join("\n"), "utf-8");

  // concat 后转 mp3
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath,
    "-codec:a", "libmp3lame", "-b:a", "96k", destMp3], { stdio: "ignore" });

  // 清理临时文件
  try { unlinkSync(listPath); unlinkSync(silencePath); } catch {}
  return getDuration(destMp3);
}

async function main() {
  // 检查依赖命令
  for (const tool of ["espeak-ng", "ffmpeg", "ffprobe"]) {
    try { run("which", [tool], { stdio: "ignore" }); }
    catch { throw new Error(`缺少系统命令：${tool}。请先安装（apt-get install espeak-ng ffmpeg）`); }
  }

  mkdirSync(audioDir, { recursive: true });

  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: "asc" },
    include: { sentences: { orderBy: { sortOrder: "asc" } } },
  });

  console.log(`🎵 开始为 ${lessons.length} 篇课文生成音频...\n`);

  for (const lesson of lessons) {
    const lessonTempDir = join(tmpdir(), `tts-${lesson.id}`);
    mkdirSync(lessonTempDir, { recursive: true });

    const destMp3 = join(audioDir, lesson.audioUrl.replace(/^\/audio\//, ""));
    console.log(`▶ [${lesson.title}] ${lesson.sentences.length} 句 → ${lesson.audioUrl}`);

    // 逐句合成
    const clips = [];
    let cursor = 0;
    const gapSec = 0.4;

    for (let i = 0; i < lesson.sentences.length; i++) {
      const s = lesson.sentences[i];
      const { outPath, duration } = synthesize(s.text, i, lessonTempDir);
      const startTime = +cursor.toFixed(2);
      const endTime = +(cursor + duration).toFixed(2);
      cursor = endTime + gapSec; // 加间隙
      clips.push({ outPath, duration });

      // 更新该句时间戳
      await prisma.sentence.update({
        where: { id: s.id },
        data: { startTime, endTime },
      });
    }

    // 拼接为 mp3
    const totalDur = concatToMp3(clips, gapSec, destMp3);

    // 更新课文总时长
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { duration: +totalDur.toFixed(2) },
    });

    console.log(`  ✅ 总时长 ${totalDur.toFixed(1)}s\n`);

    // 清理临时目录
    try { clips.forEach((c) => unlinkSync(c.outPath)); }
    catch {}
  }

  console.log("🎉 全部音频生成完成！");
  const count = lessons.length;
  console.log(`   共生成 ${count} 个 mp3 文件于 ${audioDir}`);
}

main()
  .catch((e) => { console.error("❌ 失败：", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
