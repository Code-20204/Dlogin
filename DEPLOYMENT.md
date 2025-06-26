# 🚀 部署指南

本文档介绍如何在不同环境中部署 DLogin 任务管理系统。

## 📋 环境配置

### 开发环境 (Development)
- **URL**: `http://localhost:3000`
- **配置文件**: `.env.local`
- **启动命令**: `npm run dev`

### 生产环境 (Production)
- **URL**: `https://d.studyhard.qzz.io`
- **配置文件**: `.env.production`
- **构建命令**: `npm run build:prod`
- **启动命令**: `npm run start:prod`

## 🔧 环境变量配置

### 开发环境配置 (.env.local)
```bash
# 数据库
DATABASE_URL="your-dev-database-url"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-dev-secret"

# 应用设置
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 生产环境配置 (.env.production)
```bash
# 数据库
DATABASE_URL="your-prod-database-url"

# NextAuth.js
NEXTAUTH_URL="https://d.studyhard.qzz.io"
NEXTAUTH_SECRET="your-production-secret"

# 应用设置
APP_URL="https://d.studyhard.qzz.io"
NODE_ENV="production"
```

## 🛠️ 部署步骤

### 1. 本地开发
```bash
# 安装依赖
npm install

# 设置开发环境变量
npm run env:dev

# 生成数据库客户端
npm run db:generate

# 推送数据库架构
npm run db:push

# 启动开发服务器
npm run dev
```

### 2. 生产环境部署
```bash
# 设置生产环境变量
npm run env:prod

# 检查环境配置
npm run deploy:check

# 构建生产版本
npm run deploy:build

# 启动生产服务器
npm run start:prod
```

### 3. Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到 Vercel
vercel --prod
```

## 🌐 域名配置

### 自动域名切换机制
应用会根据 `NODE_ENV` 自动选择合适的域名：

- **开发环境**: `http://localhost:3000`
- **生产环境**: `https://d.studyhard.qzz.io`

### 配置文件位置
- 开发配置: `lib/config.js` 中的 `getBaseUrl()` 函数
- Next.js 配置: `next.config.js` 中的环境变量设置

## 📧 邮件服务配置

### Resend 配置
```bash
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="super@studyhard.qzz.io"
```

### 邮件模板
- 欢迎邮件: 自动使用当前环境的域名
- 验证邮件: 自动生成正确的验证链接
- 任务提醒: 包含正确的应用链接

## 🔐 OAuth 配置

### GitHub OAuth
1. 在 GitHub 创建 OAuth App
2. 设置回调 URL:
   - 开发: `http://localhost:3000/api/auth/callback/github`
   - 生产: `https://d.studyhard.qzz.io/api/auth/callback/github`

### Google OAuth
1. 在 Google Cloud Console 创建项目
2. 设置授权重定向 URI:
   - 开发: `http://localhost:3000/api/auth/callback/google`
   - 生产: `https://d.studyhard.qzz.io/api/auth/callback/google`

## 📊 监控和日志

### 环境检查
```bash
# 检查当前环境配置
npm run deploy:check
```

### 日志输出
应用启动时会显示：
- ✅ 环境配置验证结果
- 🌍 当前运行模式
- 🔗 基础URL信息

## 🚨 故障排除

### 常见问题

1. **环境变量未加载**
   - 检查 `.env` 文件是否存在
   - 确认文件名正确（`.env.local` 或 `.env.production`）

2. **域名配置错误**
   - 检查 `NODE_ENV` 环境变量
   - 验证 `next.config.js` 中的配置

3. **OAuth 回调失败**
   - 确认 OAuth 应用的回调 URL 设置正确
   - 检查 `NEXTAUTH_URL` 环境变量

4. **邮件发送失败**
   - 验证 `RESEND_API_KEY` 是否有效
   - 检查发件人邮箱域名配置

### 调试命令
```bash
# 查看环境变量
echo $NODE_ENV
echo $NEXTAUTH_URL

# 测试数据库连接
npm run db:studio

# 检查构建输出
npm run build
```

## 📝 更新日志

- ✅ 实现自动域名切换机制
- ✅ 添加环境配置管理
- ✅ 优化邮件服务URL处理
- ✅ 完善部署脚本和文档