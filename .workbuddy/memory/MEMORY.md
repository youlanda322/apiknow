# APIKnow 项目记忆

## 项目概述
APIKnow 是一个 AI API 比价测评站 + 深度技术博客，聚合各家 AI API 价格/延迟/套餐/测评数据，同时提供工程级深度文章。

## 技术栈
- **前台**: 纯静态 HTML/CSS/JS，无框架依赖，Chart.js CDN 做图表
- **后台**: Node.js + Express + EJS + express-ejs-layouts
- **认证**: express-session + bcryptjs
- **Markdown**: gray-matter（frontmatter）+ marked（正文渲染）
- **CI/CD**: GitHub Actions → GitHub Pages（免费托管）
- **本地端口**: 8080（后台 + 前台预览同端口）

## 站点结构
```
site/                     # 前台静态站点（GitHub Pages 部署目录）
├── index.html            # 首页
├── articles.html         # 文章列表
├── article.html          # 文章详情
├── comparison.html       # API 比价页
├── calculator.html       # Token 费用计算器
├── review.html           # 测评中心
├── about.html            # 关于
├── css/styles.css        # 全站样式（复古经典风格）
├── css/blog.css          # 博客文章样式
├── js/data.js            # API 服务商数据层
├── js/articles.js        # 文章数据（构建脚本自动生成）
├── js/blog.js            # 博客前端交互
├── js/main.js            # 全局交互
├── js/charts.js          # 图表封装
└── content/              # Markdown 文章工作区
    ├── 03-草稿/
    ├── 04-审核中/
    └── 05-已发布/        # 构建源：build.js 读取此目录

admin/                    # 后台管理系统
├── server.js             # Express 入口（端口 8080）
├── config.js             # 配置（端口、路径）
├── middleware/auth.js    # 认证中间件
├── routes/               # 路由（auth/articles/categories/dashboard/settings）
├── views/                # EJS 视图（layout/login/dashboard/articles/categories/settings）
├── public/css/admin.css  # 后台样式
└── data/                 # 分类、系列、用户数据（JSON）

scripts/
├── build.js              # MD → articles.js 构建脚本
├── init-admin.js         # 初始化管理员（admin/admin123）
└── migrate-articles.js   # 旧数据迁移（一次性）

.github/workflows/deploy.yml  # GitHub Actions 自动发布
```

## 修改指南
- **写文章**: 后台 http://localhost:8080/login → 新建文章（Markdown 编辑器+实时预览）
- **改价格/服务商**: 编辑 site/js/data.js → providers 数组
- **改样式**: 前台 site/css/styles.css，后台 admin/public/css/admin.css
- **改分类**: 后台 → 分类管理页面
- **发布流程**: 后台写文章 → git push → GitHub Actions 自动构建部署
- **启动**: `npm start`（端口 8080）
- **构建**: `npm run build`
- **初始化管理员**: `npm run init-admin`

## 默认管理员
- 用户名: admin
- 密码: admin123
- ⚠ 首次登录后在设置页修改

## 部署
- 详见 DEPLOY.md
- GitHub 仓库: https://github.com/youlanda322/apiknow
- 线上地址: https://youlanda322.github.io/apiknow/
- GitHub Pages Source: GitHub Actions
- push 到 main 分支自动触发部署
- git remote: https://github.com/youlanda322/apiknow.git
- 独立 Node.js: E:\猫\nodejs\node.exe (v22.22.2)

## 源文档
E:\猫\APIknow\【排版结果】新建 DOC 文档.doc（实际为 .docx 格式，WPS 创建）
