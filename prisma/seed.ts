/**
 * Prisma 数据库种子脚本
 * 写入人教 PEP 示例内容 + 默认学生
 * 运行：npm run db:seed
 *
 * 自动适配本地 SQLite（file:./dev.db）或远程 Turso（libsql://...）。
 */
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { pepContent } from "../src/data/pep-content";

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (url.startsWith("libsql:")) {
    const adapter = new PrismaLibSQL(
      createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
    );
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = createPrismaClient();

async function main() {
  console.log("🌱 开始写入种子数据...");

  // 清空现有数据（按依赖顺序）
  console.log("🧹 清理旧数据...");
  await prisma.exerciseResult.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.sentence.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.student.deleteMany();

  // 创建默认学生
  const student = await prisma.student.create({
    data: {
      id: "default-student",
      name: "小明",
      avatar: "🧒",
    },
  });
  console.log(`✅ 创建默认学生：${student.name}`);

  // 写入年级、单元、课文
  for (const gradeData of pepContent) {
    const grade = await prisma.grade.create({
      data: {
        level: gradeData.level,
        name: gradeData.name,
        semester: gradeData.semester,
        color: gradeData.color,
        icon: gradeData.icon,
        sortOrder: gradeData.level,
        units: {
          create: gradeData.units.map((unitData) => ({
            number: unitData.number,
            title: unitData.title,
            description: unitData.description,
            icon: unitData.icon,
            sortOrder: unitData.number,
            lessons: {
              create: unitData.lessons.map((lessonData) => ({
                part: lessonData.part,
                title: lessonData.title,
                type: lessonData.type,
                audioUrl: lessonData.audioUrl,
                duration: lessonData.duration,
                icon: lessonData.icon,
                sortOrder:
                  lessonData.part.charCodeAt(0) - "A".charCodeAt(0) + 1,
                sentences: {
                  create: lessonData.sentences.map((s, idx) => ({
                    text: s.text,
                    translation: s.translation,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    speaker: s.speaker,
                    sortOrder: idx,
                  })),
                },
                exercises: {
                  create: lessonData.exercises.map((e, idx) => ({
                    type: e.type,
                    question: e.question,
                    options: e.options ? JSON.stringify(e.options) : null,
                    answer: e.answer,
                    explanation: e.explanation,
                    audioStartTime: e.audioStartTime,
                    sortOrder: idx,
                  })),
                },
              })),
            },
          })),
        },
      },
    });
    console.log(
      `✅ 创建 ${grade.name}（${grade.semester}），含 ${gradeData.units.length} 个单元`
    );
  }

  console.log("\n🎉 种子数据写入完成！");
  const stats = {
    grades: await prisma.grade.count(),
    units: await prisma.unit.count(),
    lessons: await prisma.lesson.count(),
    sentences: await prisma.sentence.count(),
    exercises: await prisma.exercise.count(),
  };
  console.table(stats);
}

main()
  .catch((e) => {
    console.error("❌ 种子数据写入失败：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
