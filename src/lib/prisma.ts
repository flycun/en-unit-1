import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

/**
 * Prisma 客户端单例
 * 避免开发模式下热重载创建过多连接
 *
 * 数据库连接（通过 DATABASE_URL 环境变量）：
 * - 本地开发：file:./dev.db          → 使用本地 SQLite
 * - 生产 / 边缘部署：libsql://...    → 使用 Turso（边缘 libSQL 数据库）
 *
 * 当 DATABASE_URL 以 "libsql:" 开头时，走 Turso 远程连接，
 * 需要 TURSO_AUTH_TOKEN 提供访问令牌。
 */
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  // 远程 Turso：通过 libSQL adapter（HTTP 连接，适配 Edge / Serverless）
  if (url.startsWith("libsql:")) {
    const adapter = new PrismaLibSQL(
      createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
    );
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }

  // 本地 SQLite：保持原有原生连接
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
