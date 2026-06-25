#!/usr/bin/env bash
# =============================================================================
# EdgeOne Pages 手工部署脚本
#
# 用途：一键将本项目部署到 EdgeOne Pages（海外区域，不含中国大陆）。
#       自动完成：环境检查 → 读取本地 .env → 同步环境变量到 EdgeOne 项目 → 构建+部署。
#
# 用法：
#   bash scripts/deploy-edgeone.sh              # 部署到默认项目 en-unit-1
#   bash scripts/deploy-edgeone.sh my-project   # 指定项目名（首次创建用）
#   PROJECT_NAME=foo bash scripts/deploy-edgeone.sh
#
# 前提：
#   1. 已安装 edgeone CLI：npm install -g edgeone@latest
#   2. 已登录：edgeone login --site global
#   3. 项目根目录有 .env，包含 DATABASE_URL 和 TURSO_AUTH_TOKEN（Turso 凭据）
# =============================================================================
set -euo pipefail

# ---------- 配置 ----------
PROJECT_NAME="${1:-${PROJECT_NAME:-en-unit-1}}"   # 项目名（可被参数或环境变量覆盖）
DEPLOY_AREA="${DEPLOY_AREA:-overseas}"             # 部署区域：overseas（海外，不含大陆）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
MIN_CLI_VERSION="1.2.30"

# 标记部署由 skill 上下文触发（EdgeOne 要求）
export PAGES_SOURCE=skills

# ---------- 工具函数 ----------
c_red()    { printf "\033[31m%s\033[0m\n" "$*"; }
c_green()  { printf "\033[32m%s\033[0m\n" "$*"; }
c_yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
c_cyan()   { printf "\033[36m%s\033[0m\n" "$*"; }
info()     { printf "▸ %s\n" "$*"; }
ok()       { printf "  %s %s\n" "$(c_green '✓')" "$*"; }
warn()     { printf "  %s %s\n" "$(c_yellow '⚠')" "$*"; }
die()      { printf "  %s %s\n" "$(c_red '✘')" "$*"; exit 1; }

# 版本号比较：$1 >= $2 返回 0
version_ge() {
  printf '%s\n%s' "$2" "$1" | sort -V -C
}

cd "$PROJECT_DIR"

echo ""
c_cyan "🚀 EdgeOne Pages 部署脚本"
echo "   项目: $PROJECT_NAME"
echo "   区域: $DEPLOY_AREA（海外，不含中国大陆）"
echo ""

# ---------- Step 1: 检查 edgeone CLI ----------
info "检查 edgeone CLI..."
if ! command -v edgeone >/dev/null 2>&1; then
  die "未安装 edgeone CLI。请先运行: npm install -g edgeone@latest"
fi
CLI_VER="$(edgeone -v 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
if [ -z "$CLI_VER" ]; then
  die "无法解析 edgeone CLI 版本"
fi
if ! version_ge "$CLI_VER" "$MIN_CLI_VERSION"; then
  die "edgeone CLI 版本过低 ($CLI_VER < $MIN_CLI_VERSION)。请运行: npm install -g edgeone@latest"
fi
ok "edgeone CLI $CLI_VER（≥ $MIN_CLI_VERSION）"

# ---------- Step 2: 检查登录状态 ----------
info "检查登录状态..."
if edgeone whoami >/dev/null 2>&1; then
  ACCOUNT="$(edgeone whoami 2>/dev/null | grep -iE 'account name' | head -1 | sed -E 's/.*:\s*//' || true)"
  ok "已登录${ACCOUNT:+（账号: $ACCOUNT）}"
else
  die "未登录。请先运行: edgeone login --site global"
fi

# ---------- Step 3: 读取本地 .env ----------
info "读取 .env 中的 Turso 凭据..."
if [ ! -f "$ENV_FILE" ]; then
  die "未找到 .env 文件: $ENV_FILE"
fi

# 安全地提取变量值（不打印令牌）
get_env_value() {
  local key="$1"
  # 读取 KEY="value" 或 KEY=value，去掉引号
  grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -1 | sed -E "s/^${key}=//" | sed -E 's/^"(.*)"$/\1/' | sed -E "s/^'(.*)'$/\1/" | tr -d '\r'
}

DB_URL="$(get_env_value DATABASE_URL)"
DB_TOKEN="$(get_env_value TURSO_AUTH_TOKEN)"

if [ -z "$DB_URL" ]; then
  die ".env 中缺少 DATABASE_URL"
fi
if [ -z "$DB_TOKEN" ]; then
  die ".env 中缺少 TURSO_AUTH_TOKEN"
fi
if [[ "$DB_URL" != libsql://* ]]; then
  warn "DATABASE_URL 不是 libsql: 开头（当前: ${DB_URL:0:20}...），部署到 EdgeOne 需用远程 Turso 地址"
fi
ok "DATABASE_URL 已读取（${DB_URL:0:45}...）"
ok "TURSO_AUTH_TOKEN 已读取（长度 ${#DB_TOKEN}，已隐藏）"

# ---------- Step 4: 生成 Prisma 客户端（确保构建期 client 就绪）----------
info "生成 Prisma 客户端（构建所需）..."
if npm run db:generate >/dev/null 2>&1; then
  ok "Prisma 客户端已生成"
else
  warn "db:generate 有警告/失败，构建可能报错（继续尝试部署）"
fi

# ---------- Step 5: 同步环境变量到 EdgeOne 项目 ----------
info "同步环境变量到 EdgeOne 项目..."
if edgeone pages env set DATABASE_URL "$DB_URL" >/dev/null 2>&1; then
  ok "DATABASE_URL 已同步到 EdgeOne"
else
  warn "同步 DATABASE_URL 失败（可能网络抖动，部署前确认控制台已配置）"
fi
if edgeone pages env set TURSO_AUTH_TOKEN "$DB_TOKEN" >/dev/null 2>&1; then
  ok "TURSO_AUTH_TOKEN 已同步到 EdgeOne"
else
  warn "同步 TURSO_AUTH_TOKEN 失败（可能网络抖动，部署前确认控制台已配置）"
fi

# ---------- Step 6: 部署 ----------
info "部署到 EdgeOne Pages（区域: $DEPLOY_AREA）..."
echo ""
DEPLOY_OUTPUT="$(edgeone pages deploy -a "$DEPLOY_AREA" 2>&1)" || {
  echo "$DEPLOY_OUTPUT" | tail -30
  die "部署失败，详见上方日志"
}

# ---------- Step 7: 解析并输出结果 ----------
DEPLOY_URL="$(echo "$DEPLOY_OUTPUT" | grep -E '^EDGEONE_DEPLOY_URL=' | head -1 | cut -d= -f2-)"
PROJECT_ID="$(echo "$DEPLOY_OUTPUT" | grep -E '^EDGEONE_PROJECT_ID=' | head -1 | cut -d= -f2-)"

echo ""
c_green "══════════════════════════════════════════════════════"
echo "  ✅ 部署成功！"
c_green "══════════════════════════════════════════════════════"
echo ""
if [ -n "$DEPLOY_URL" ]; then
  echo "  🔗 访问地址（含鉴权参数，请完整复制）："
  c_cyan "     $DEPLOY_URL"
  echo ""
  warn "该预览 URL 含 eo_token 鉴权参数，浏览器打开后会写入 Cookie。"
  warn "分享或长期使用建议绑定自定义域名。"
fi
if [ -n "$PROJECT_ID" ]; then
  echo ""
  echo "  📋 项目 ID: $PROJECT_ID"
  echo "  🛠  控制台: https://console.tencentcloud.com/edgeone/pages/project/$PROJECT_ID"
fi
echo ""
c_cyan "  验证数据库连接（需先带 token 访问一次以获取 Cookie）："
echo "    COOKIE=\$(mktemp)"
echo "    curl -s -c \$COOKIE -o /dev/null '${DEPLOY_URL}'"
echo "    curl -s -b \$COOKIE 'https://${PROJECT_NAME}.edgeone.cool/api/grades'"
echo ""
