# 部署说明 🚀

本项目是 **Next.js 14 (App Router) 全栈应用**，使用 **SQLite + Prisma** 作为数据库。由于 SQLite 依赖本地文件持久化，**部署平台的选择至关重要**——请先阅读 [平台选择](#-平台选择) 一节。

> 📌 仓库：https://github.com/flycun/en-unit-1

---

## 📋 环境要求

| 项目 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 18（推荐 20 LTS） | 运行时与构建时 |
| npm | ≥ 9 | 包管理 |
| 磁盘 | ≥ 1GB | 含 `node_modules` + 音频资源 |

> ⚠️ 运行时**不需要** `ffmpeg` / `espeak-ng`，这两个系统命令仅 [`scripts/generate-audio.mjs`](scripts/generate-audio.mjs) 在**本地生成音频**时使用。

---

## 🧭 平台选择

> **2026-06 更新**：项目已集成 **Turso（libSQL 边缘数据库）**，支持零服务器部署到 EdgeOne Pages / Vercel 等 Serverless 平台。数据库连接通过环境变量自动切换本地 SQLite（`file:`）与远程 Turso（`libsql:`）。

| 平台 | 部署方式 | 推荐度 | 说明 |
|------|------|:---:|------|
| **EdgeOne Pages + Turso** | 零服务器 | ⭐⭐⭐ 首选 | 应用托管于腾讯云边缘节点，数据库由 Turso 托管，全程无需自建服务器 |
| **Vercel + Turso** | 零服务器 | ⭐⭐⭐ 首选 | 同上，Vercel 原生支持 Next.js |
| **Node 服务器 / VPS**（PM2） | 自建服务器 | ⭐⭐ | 可继续用本地 SQLite（`file:./dev.db`） |
| **Docker / 容器** | 自建/托管 | ⭐⭐ | 可继续用本地 SQLite |

- 想用**腾讯云 EdgeOne**：看 [方案 C：EdgeOne Pages + Turso](#-方案-cedgeone-pages--turso-零服务器首选)
- 想**继续用本地 SQLite / 自建服务器**：看 [方案 A：VPS + PM2](#-方案-anode-服务器部署vps--pm2首选) / [方案 B：Docker](#-方案-bdocker-部署首选)

---

## 🔧 通用准备（所有方案通用）

### 1. 克隆仓库

```bash
git clone https://github.com/flycun/en-unit-1.git
cd en-unit-1
```

### 2. 配置环境变量

创建 `.env` 文件（已加入 `.gitignore`，不会上传）：

```bash
# 数据库连接（SQLite 文件路径，相对于项目根目录）
DATABASE_URL="file:./dev.db"
```

### 3. 安装依赖并生成 Prisma 客户端

```bash
npm install
npm run db:generate      # ⚠️ 关键：生成 Prisma Client，没有 postinstall 自动执行
```

> ⚠️ **常见坑**：本项目 `package.json` **未配置 `postinstall` 钩子**，`npm install` 后**必须手动执行** `npm run db:generate`，否则运行时报 `@prisma/client did not initialize yet`。

### 4. 初始化数据库

```bash
npm run db:push          # 根据 schema.prisma 创建表结构（无迁移文件）
npm run db:seed          # 写入 PEP 示例数据（年级/单元/课文/练习）
```

### 5. 本地生产验证（部署前自测）

```bash
npm run build            # 生产构建
npm run start            # 以生产模式启动
# 访问 http://localhost:3000 验证
```

---

## 🌐 方案 C：EdgeOne Pages + Turso（零服务器，首选）

适合：**没有自己的服务器**、希望全程托管、享受全球边缘加速。本方案是当前推荐的部署方式。

架构：

```
用户 ──▶ EdgeOne Pages（腾讯云边缘节点，托管应用代码）
                      │
                      └──▶ Turso（托管 libSQL 数据库，HTTP 连接）
```

全程无需自建任何服务器，均有免费额度。

### 第 1 步：创建 Turso 数据库（托管数据库）

1. **注册**：打开 [turso.tech](https://turso.tech)，用 GitHub 账号登录（免费）
2. **建库**：安装 Turso CLI 或用 Web 控制台创建数据库
   ```bash
   # 用 CLI（推荐）
   curl -sSfL https://get.tur.so/install.sh | bash   # 安装 CLI
   turso auth login                                   # 登录
   turso db create en-unit-1                          # 创建数据库
   ```
3. **获取连接信息**（部署时会用到）
   ```bash
   turso db show en-unit-1 --url        # 得到 DATABASE_URL，形如 libsql://en-unit-1-<user>.turso.io
   turso db tokens create en-unit-1     # 得到 TURSO_AUTH_TOKEN（一长串令牌）
   ```
   > 这两个值即 Turso 的"地址"和"密码"，妥善保存。

### 第 2 步：初始化 Turso 数据库表结构 + 种子数据

在本地项目目录执行（只需做一次）：

```bash
# 1. 临时把 .env 切到 Turso（或用 export 临时注入）
export DATABASE_URL="libsql://en-unit-1-<user>.turso.io"
export TURSO_AUTH_TOKEN="<你的令牌>"

# 2. 创建表结构（Turso 不支持 prisma migrate，必须用 db push）
npm run db:generate    # 生成含 driver adapter 的客户端
npm run db:push        # 把 schema.prisma 同步到 Turso
npm run db:seed        # 写入 PEP 示例数据
```

> 代码已做双模式适配：`DATABASE_URL` 以 `libsql:` 开头时自动走 Turso，以 `file:` 开头时走本地 SQLite。无需改代码。

### 第 3 步：在 EdgeOne Pages 部署

1. 登录 [EdgeOne Pages 控制台](https://console.tencentcloud.com/teo)
2. **创建项目** → 选择 **从 Git 仓库导入** → 授权并选择 GitHub 仓库 `flycun/en-unit-1`
3. **构建设置**（一般自动识别 Next.js，确认即可）：
   - 框架预设：Next.js
   - 构建命令：`npm run build`
   - 输出目录：`.next`
   - 安装命令：`npm install`
4. **配置环境变量**（关键）：

   | 变量名 | 值 |
   |--------|-----|
   | `DATABASE_URL` | `libsql://en-unit-1-<user>.turso.io` |
   | `TURSO_AUTH_TOKEN` | 第 1 步获取的令牌 |
   | `NODE_ENV` | `production` |

5. **部署** → EdgeOne 自动执行 `npm install && npm run build` 并发布到边缘节点
6. 部署完成后获得 `xxx.edgeone.app` 域名，可直接访问

> ⚠️ EdgeOne Pages 负责构建时运行 `npm install`，但本项目的 `prisma generate` 没有配 `postinstall` 钩子。若构建报 `@prisma/client did not initialize`，需在 EdgeOne 构建命令中补一步：`npm run db:generate && npm run build`。

### 第 4 步：绑定自定义域名（可选）

在 EdgeOne 控制台 → 域名管理 → 添加自定义域名，EdgeOne 自动签发 HTTPS 证书。

### Turso 免费额度（参考）

| 项目 | 免费额度 |
|------|---------|
| 数据库数量 | 500 个 |
| 总存储 | 9 GB |
| 每月行读取 | 10 亿次 |
| 每月行写入 | 2500 万次 |

本学习应用的数据量（几十篇课文 + 学生进度）远在免费额度内。

---

## ✅ 方案 A：Node 服务器部署（VPS + PM2）

适合：自有云服务器（腾讯云 / 阿里云 / DigitalOcean / AWS EC2）。

### 步骤

```bash
# 1. 在服务器上完成 [通用准备] 的 1~4 步

# 2. 全局安装 PM2（进程守护，崩溃自动重启）
npm install -g pm2

# 3. 以生产模式启动（默认监听 3000 端口）
pm2 start npm --name "en-unit-1" -- run start

# 4. （可选）开机自启
pm2 save
pm2 startup            # 按提示执行返回的命令

# 5. 查看日志 / 状态
pm2 logs en-unit-1
pm2 status
```

### Nginx 反向代理（示例）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;     # 必要：HMR / WebSocket
        proxy_set_header Connection "upgrade";
    }
}
```

配合 certbot 申请免费 HTTPS 证书：`sudo certbot --nginx -d your-domain.com`

---

## 🐳 方案 B：Docker 部署 — 首选

适合：任何支持容器的环境（容器服务、K8s、自建主机）。

### 1. 编写 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# ---------- 阶段 1：依赖 ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- 阶段 2：构建 ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 生成 Prisma Client（构建期需要）
RUN npx prisma generate
# 构建时 DATABASE_URL 只需占位（build 阶段不连接数据库）
ENV DATABASE_URL="file:./dev.db"
RUN npm run build

# ---------- 阶段 3：运行 ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL="file:./dev.db"
ENV PORT=3000

# 仅复制运行所需产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 持久化数据库：用 named volume 挂载到 ./dev.db 位置
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["node", "server.js"]
```

> ⚠️ 上面的 Dockerfile 使用了 Next.js 的 `standalone` 输出模式，需先在 `next.config.mjs` 中开启（见下方 [开启 standalone 输出](#开启-standalone-输出可选-用于-docker)）。

### 2. 开启 standalone 输出（可选，用于 Docker）

编辑 `next.config.mjs`：

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",   // 新增：生成自包含 server.js
};
export default nextConfig;
```

### 3. 编写 docker-compose.yml

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - db-data:/app        # 持久化 dev.db（容器重建后数据不丢）
    restart: unless-stopped

volumes:
  db-data:
```

> 注：若把 `dev.db` 放在 `/app/data/dev.db`，请同步修改 `DATABASE_URL="file:./data/dev.db"`，确保 volume 挂载点与文件路径一致。

### 4. 启动

```bash
docker compose up -d --build
# 首次需初始化数据库（在容器内执行）
docker compose exec web npx prisma db push
docker compose exec web npm run db:seed
```

---

## 🔒 HTTPS / 域名

无论哪种方案，对外服务都建议走 HTTPS：

- **VPS**：Nginx + Let's Encrypt（certbot）
- **Docker**：配合 [Caddy](https://caddyserver.com/)（自动 HTTPS）或 Nginx + certbot 容器
- **云容器服务**：通常自带域名 + 免费证书

---

## 🎵 音频资源说明

- 课文音频位于 [`public/audio/`](public/audio/)，随仓库一起部署，由 Next.js 作为静态资源托管（`/audio/xxx.mp3`）
- 运行时**不依赖** `ffmpeg`/`espeak-ng`
- 若需**重新生成**音频（更新课文内容时），在本地执行 `node scripts/generate-audio.mjs`（需安装 `espeak-ng` 与 `ffmpeg`），生成后提交音频文件

---

## 🩺 排查常见问题

| 现象 | 原因 | 解决 |
|------|------|------|
| `@prisma/client did not initialize yet` | 未执行 `prisma generate` | 运行 `npm run db:generate` |
| 接口 500 / `no such table` | 未初始化表结构 | 运行 `npm run db:push` |
| 页面无数据 | 未写入种子数据 | 运行 `npm run db:seed` |
| Vercel / EdgeOne 上进度/成绩无法保存 | 用了本地 SQLite（文件系统只读）| 改用 Turso：`DATABASE_URL` 设为 `libsql://...`（见方案 C）|
| Turso 连接失败 / `401 Unauthorized` | `TURSO_AUTH_TOKEN` 未配或失效 | 确认 token 正确，重新 `turso db tokens create` |
| 同步高亮不准 | 音频实际时长与 DB 时间戳不符 | 用 `generate-audio.mjs` 重新生成并校准 |
| 端口被占用 | 3000 端口冲突 | `PORT=3001 npm run start` |

---

## 📦 环境变量速查

| 变量 | 必需 | 默认/示例 | 说明 |
|------|:---:|------|------|
| `DATABASE_URL` | ✅ | `file:./dev.db`（本地）<br>`libsql://...`（Turso） | Prisma 数据库连接串。`file:` 走本地 SQLite，`libsql:` 走 Turso |
| `TURSO_AUTH_TOKEN` | ⚠️ 仅 Turso | `eyJ...` | 仅当 `DATABASE_URL` 为 `libsql:` 时需要 |
| `PORT` | ❌ | `3000` | 服务监听端口 |
| `NODE_ENV` | ✅ | `production` | 运行环境 |

---

## 附录：数据库方案说明

项目支持**双模式**数据库连接，由 `DATABASE_URL` 前缀自动切换（见 [`src/lib/prisma.ts`](src/lib/prisma.ts)）：

### 当前已集成：Turso（libSQL 边缘数据库）✅

适合 EdgeOne Pages / Vercel 等 Serverless 平台，零服务器部署。集成已完成，详见 [方案 C](#-方案-cedgeone-pages--turso-零服务器首选)。

### 备选：PostgreSQL（如需更强的关系型能力）

若未来需要 PostgreSQL 独有特性（JSONB、全文检索、复杂并发），可切换：

1. 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"          // 由 sqlite 改为 postgresql
  url      = env("DATABASE_URL")
}
```

2. 更新 `.env`：

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

3. 重新生成并迁移：

```bash
npm run db:generate
npx prisma migrate dev --name init   # 生成迁移文件
npm run db:seed
```

> 注：切换到 PostgreSQL 后，需移除 `src/lib/prisma.ts` 与 `prisma/seed.ts` 中的 libSQL adapter 分支，改回原生 Prisma 连接。推荐的 PostgreSQL 服务：**Neon** / **Supabase**（免费 Serverless PG）。

---

## ✅ 部署检查清单

### 本地开发 / 自建服务器（SQLite 模式）
- [ ] Node.js ≥ 18
- [ ] `.env` 中 `DATABASE_URL="file:./dev.db"`
- [ ] 执行了 `npm run db:generate`
- [ ] 执行了 `npm run db:push` 创建表
- [ ] 执行了 `npm run db:seed` 写入示例数据
- [ ] `npm run build` 通过
- [ ] `npm run start` 可正常访问 http://host:3000

### EdgeOne Pages / Vercel（Turso 模式，零服务器）
- [ ] 已在 [turso.tech](https://turso.tech) 创建数据库 `en-unit-1`
- [ ] 本地执行过 `db:generate` + `db:push` + `db:seed` 初始化 Turso
- [ ] 平台环境变量已配置 `DATABASE_URL`（`libsql://...`）
- [ ] 平台环境变量已配置 `TURSO_AUTH_TOKEN`
- [ ] 平台构建命令包含 `prisma generate`（如 `npm run db:generate && npm run build`）
- [ ] 部署成功，首页能加载年级/课文数据
- [ ] 听读课文后进度能保存（验证 Turso 写入生效）
- [ ] 配置了自定义域名 + HTTPS（对外服务）
