# DLogin 任务管理系统

一个现代化的任务管理应用，支持多种登录方式和智能自动化列表功能。

## 🚀 功能特性

### 认证系统
- ✅ 邮箱密码登录
- ✅ GitHub OAuth 登录
- ✅ Google OAuth 登录
- ✅ 安全的JWT认证
- ✅ 自动注册和登录流程

### 任务管理
- ✅ 创建和管理任务列表
- ✅ 任务优先级设置（高/中/低）
- ✅ 截止日期管理
- ✅ 任务完成状态跟踪
- ✅ 过期任务提醒

### 智能自动化
- ✅ 基于规则的智能列表
- ✅ 预设模板（本周到期、已过期、高优先级等）
- ✅ 自定义规则构建器
- ✅ 实时数据筛选

### 用户体验
- ✅ 响应式设计，支持移动端
- ✅ 现代化UI界面
- ✅ 实时数据更新
- ✅ 直观的统计面板

## 🛠️ 技术栈

- **前端框架**: Next.js 14
- **认证系统**: NextAuth.js
- **数据库**: PostgreSQL + Prisma ORM
- **样式**: Tailwind CSS
- **状态管理**: React Query
- **图标**: Lucide React
- **日期处理**: date-fns

## 📦 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd dlogin
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制 `.env.local` 文件并配置以下环境变量：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/dlogin_db?schema=public"

# NextAuth.js 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. 数据库设置

#### 安装 PostgreSQL
1. 下载并安装 [PostgreSQL](https://www.postgresql.org/download/)
2. 创建数据库：
```sql
CREATE DATABASE dlogin_db;
```

#### 运行数据库迁移
```bash
npx prisma generate
npx prisma db push
```

### 5. OAuth 应用配置

#### GitHub OAuth
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 设置回调URL: `http://localhost:3000/api/auth/callback/github`
4. 复制 Client ID 和 Client Secret 到环境变量

#### Google OAuth
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 设置回调URL: `http://localhost:3000/api/auth/callback/google`
6. 复制 Client ID 和 Client Secret 到环境变量

### 6. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

## 📁 项目结构

```
dlogin/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth].js    # NextAuth 配置
│   │   │   └── register.js         # 用户注册
│   │   ├── lists/
│   │   │   ├── index.js            # 列表管理
│   │   │   ├── [listId].js         # 单个列表
│   │   │   └── [listId]/items.js   # 列表项管理
│   │   └── items/
│   │       └── [itemId].js         # 单个项目
│   ├── login.js                    # 登录页面
│   ├── dashboard.js                # 仪表板
│   ├── index.js                    # 首页重定向
│   └── _app.js                     # 应用配置
├── components/
│   ├── AuthGuard.js                # 认证守卫
│   ├── AutoListBuilder.js          # 自动化列表构建器
│   └── ListView.js                 # 列表视图
├── lib/
│   ├── db.js                       # 数据库连接
│   └── automation.js               # 自动化规则引擎
├── prisma/
│   └── schema.prisma               # 数据库模式
├── styles/
│   └── globals.css                 # 全局样式
└── README.md
```

## 🎯 使用指南

### 登录方式
1. **邮箱密码**: 注册新账户或使用现有账户登录
2. **GitHub**: 使用GitHub账户快速登录
3. **Google**: 使用Google账户快速登录

### 创建任务列表
1. 点击侧边栏的 "+" 按钮
2. 选择列表类型：
   - **手动列表**: 手动添加和管理任务
   - **智能列表**: 基于规则自动筛选任务

### 智能列表规则
智能列表支持以下规则类型：
- **截止日期**: 今天、明天、本周末等
- **完成状态**: 已完成、未完成
- **优先级**: 高、中、低
- **文本匹配**: 标题或描述包含特定内容

### 任务管理
- 添加任务时可设置标题、描述、截止日期和优先级
- 点击圆圈图标标记任务完成
- 过期未完成的任务会以红色显示
- 支持编辑和删除任务

## 🔧 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 数据库相关
npx prisma generate      # 生成Prisma客户端
npx prisma db push       # 推送数据库变更
npx prisma studio        # 打开数据库管理界面
```

## 🚀 部署

### Vercel 部署
1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

### 环境变量配置
确保在生产环境中正确配置所有环境变量，特别是：
- `NEXTAUTH_URL`: 设置为实际域名
- `NEXTAUTH_SECRET`: 使用强密码
- OAuth 回调URL: 更新为生产域名

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 常见问题

### Q: 数据库连接失败
A: 检查 `DATABASE_URL` 是否正确配置，确保 PostgreSQL 服务正在运行。

### Q: OAuth 登录失败
A: 检查 OAuth 应用配置，确保回调URL正确，Client ID 和 Secret 有效。

### Q: 智能列表不显示任务
A: 检查规则配置是否正确，确保有符合条件的任务存在。

### Q: 样式显示异常
A: 确保 Tailwind CSS 正确安装和配置，运行 `npm run dev` 重新编译。

---

如有问题，请查看文档或提交 Issue。