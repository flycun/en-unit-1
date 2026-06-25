#!/usr/bin/env node
/**
 * 将 Prisma schema 的表结构应用到远程 Turso 数据库
 *
 * 背景：Prisma CLI 的 migrate/db push 命令不支持 libsql: 协议
 * （sqlite provider 强制要求 file: URL）。
 *
 * 策略：
 * 1. 用一个临时本地 SQLite 文件执行 `prisma migrate diff` 生成建表 SQL
 * 2. 通过 @libsql/client 的 HTTP 客户端，把这些 SQL 逐条发送到远程 Turso 执行
 *
 * 无需 Turso CLI，只用项目已有的 Prisma + @libsql/client。
 * 运行：node scripts/migrate-turso.mjs
 */
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !url.startsWith("libsql:")) {
    throw new Error(`DATABASE_URL 必须是 libsql: 地址，当前为: ${url}`);
  }
  if (!token) {
    throw new Error("缺少 TURSO_AUTH_TOKEN");
  }

  console.log("🔧 生成建表 SQL（基于 prisma/schema.prisma）...");

  // 临时目录放一个本地 SQLite，仅用于 migrate diff 生成 SQL
  const tmpDir = mkdtempSync(join(tmpdir(), "turso-migrate-"));
  const tmpDb = join(tmpDir, "tmp.db");

  // migrate diff: 从空库 → schema.prisma 的完整差异 SQL（建表语句）
  const sql = execSync(
    `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`,
    { env: { ...process.env, DATABASE_URL: `file:${tmpDb}` } }
  )
    .toString()
    .trim();
  rmSync(tmpDir, { recursive: true, force: true });

  if (!sql) {
    console.log("⚠️ 未生成任何 SQL（schema 可能为空）");
    return;
  }

  console.log(`📄 生成 SQL 共 ${sql.length} 字符，开始应用到远程 Turso...`);
  console.log(`   目标: ${url}\n`);

  const client = createClient({ url, authToken: token });

  // libSQL 的 execute 可执行多条语句（用分号分隔），逐块执行以获得清晰错误
  // Prisma migrate diff 产出的语句以分号结尾，直接批量执行
  try {
    await client.executeMultiple(sql);
    console.log("✅ 表结构创建成功！");
  } catch (err) {
    // executeMultiple 不支持某些语句时，退化为逐条执行
    console.log("批量执行遇到问题，尝试逐条执行...");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));
    let ok = 0;
    let skipped = 0;
    for (const stmt of statements) {
      try {
        await client.execute(stmt);
        ok++;
      } catch (e) {
        // 忽略 "table already exists" 之类的幂等错误
        const msg = String(e.message || e);
        if (/already exists|duplicate/i.test(msg)) {
          skipped++;
        } else {
          throw new Error(`执行失败: ${msg}\n语句: ${stmt.slice(0, 80)}...`);
        }
      }
    }
    console.log(`✅ 完成：${ok} 条成功，${skipped} 条跳过（已存在）`);
  }

  // 验证：列出所有表
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  console.log(`\n📋 远程数据库现有表（${tables.rows.length} 个）:`);
  for (const row of tables.rows) {
    console.log(`   - ${row.name}`);
  }
}

main().catch((e) => {
  console.error("❌ 迁移失败:", e.message || e);
  process.exit(1);
});
