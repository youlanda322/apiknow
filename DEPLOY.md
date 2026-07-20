# APIKnow 部署指南

## 架构概览

```
本地写作 (Node 后台)  →  Git Push  →  GitHub Actions  →  GitHub Pages
     ↓                                自动构建              免费托管
 site/content/*.md                site/js/articles.js     用户访问
```

- **后台管理**: Node.js + Express，本地运行，端口 8080
- **文章存储**: Markdown 文件 + YAML frontmatter
- **构建流程**: `scripts/build.js` 将 MD 编译为 `site/js/articles.js`
- **托管平台**: GitHub Pages，完全免费，无需服务器
- **自动发布**: GitHub Actions 监听 push，自动构建并部署

---

## 一、本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化管理员账号

```bash
npm run init-admin
```

默认账号：`admin` / `admin123`（登录后请在「设置」页修改密码）

### 3. 构建文章数据

```bash
npm run build
```

将 `site/content/05-已发布/*.md` 编译为 `site/js/articles.js`。

### 4. 启动后台

```bash
npm start
```

访问地址：
- 后台管理: http://localhost:8080/login
- 前台预览: http://localhost:8080/index.html

---

## 二、写作流程

### 创建文章

1. 登录后台 → 点击「✏️ 新建文章」
2. 填写文章信息（标题、分类、标签、摘要等）
3. 在 Markdown 编辑器中撰写正文（左侧编辑，右侧实时预览）
4. 选择保存状态：
   - **草稿** → 存入 `site/content/03-草稿/`
   - **审核中** → 存入 `site/content/04-审核中/`
   - **已发布** → 存入 `site/content/05-已发布/`
5. 点击「保存文章」→ 自动触发构建，前台即时可预览

### 编辑文章

1. 进入「文章管理」页面
2. 点击文章标题旁的「编辑」
3. 编辑器会加载现有 Markdown 内容和 frontmatter 字段
4. 修改后保存即可

### 分类管理

1. 进入「分类管理」页面
2. 填写英文 ID（如 `security`）和中文名称（如「安全实践」）
3. 点击「添加分类」
4. 已有分类可在线修改名称或删除

---

## 三、GitHub Pages 部署

### 1. 创建 GitHub 仓库

```bash
# 在项目根目录初始化 Git
git init
git add .
git commit -m "APIKnow 博客系统"

# 在 GitHub 上创建新仓库后
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

### 2. 启用 GitHub Pages

1. 打开仓库页面 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 保存设置

### 3. 验证自动发布

1. 推送代码后，进入仓库 **Actions** 标签页
2. 应看到「Deploy to GitHub Pages」工作流正在运行
3. 工作流完成后，访问 `https://<你的用户名>.github.io/<仓库名>/` 即可看到博客

### 4. 日常发布

```bash
# 写完文章后
git add .
git commit -m "新文章：文章标题"
git push
# GitHub Actions 自动构建部署，1-2 分钟后博客更新
```

---

## 四、配置说明

### 端口修改

编辑 `admin/config.js`：

```js
port: process.env.PORT || 8080,  // 改为你想要的端口
```

或通过环境变量：

```bash
PORT=3000 npm start
```

### 文章 frontmatter 字段

```yaml
---
title: "文章标题"
slug: "url-friendly-slug"
category: "fundamentals"          # 对应分类 ID
status: "published"               # draft / review / published
author: "APIKnow 编辑部"
published_at: "2026-07-20"
updated_at: "2026-07-20"
reading_time: "10 分钟"
level: "入门"                     # 入门 / 基础进阶 / 中级 / 高级
tags:
  - "HTTP"
  - "DNS"
dek: "一句话摘要"
featured: true                    # 首页精选推荐
sources:
  - "参考资料1"
  - "参考资料2"
---
```

### 目录结构

```
site/content/
├── 01-选题池/          # 选题规划
├── 02-文章模板/         # 写作模板
├── 03-草稿/            # 草稿文章
├── 04-审核中/          # 待审核文章
├── 05-已发布/          # 已发布文章（构建源）
├── 06-资料证据/         # 参考资料
├── 07-文章图片/         # 文章配图
├── 08-测评数据/         # 测评原始数据
└── 09-归档/            # 已删除文章归档
```

---

## 五、自定义域名（可选）

1. 在 `site/` 目录下创建 `CNAME` 文件，写入你的域名
2. 在域名 DNS 设置中添加 CNAME 记录指向 `<你的用户名>.github.io`
3. GitHub Actions 会自动将 CNAME 文件包含在部署中

---

## 六、常见问题

### Q: 推送后 GitHub Actions 没有触发？

检查 `.github/workflows/deploy.yml` 的 `on.push.branches` 配置，确保与你的分支名一致（默认 `main` 和 `master`）。

### Q: 前台文章列表为空？

确认 `site/content/05-已发布/` 下有 `.md` 文件，且已运行 `npm run build` 生成 `site/js/articles.js`。

### Q: 后台无法登录？

运行 `npm run init-admin` 重新初始化管理员账号。如果 `admin/data/users.json` 已存在，需先删除它。

### Q: 如何修改后台样式？

编辑 `admin/public/css/admin.css`，该文件复用了前台的 CSS 变量体系（暖色底、深海军蓝、复古金）。

### Q: articles.js 需要提交到 Git 吗？

需要。`site/js/articles.js` 是构建产物，但在 CI 中会重新生成覆盖。提交它是为了本地开发时无需每次手动构建。`.gitignore` 没有排除它。

---

## 七、技术栈

| 组件 | 技术 |
|------|------|
| 后台框架 | Express 4.x + EJS 3.x |
| 布局引擎 | express-ejs-layouts |
| 认证 | express-session + bcryptjs |
| Markdown 解析 | gray-matter（frontmatter）+ marked（正文） |
| 前台 | 纯 HTML/CSS/JS，无框架 |
| 图表 | Chart.js（CDN） |
| 图标 | Lucide（本地） |
| 托管 | GitHub Pages |
| CI/CD | GitHub Actions |
