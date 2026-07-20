const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const config = require('./config');

const app = express();

// EJS + 布局
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// 中间件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

// 后台静态资源
app.use('/admin/static', express.static(path.join(__dirname, 'public')));

// 前台站点预览（同时 serve site/）
app.use(express.static(config.siteDir));

// 让 username 在所有 EJS 视图中可用
app.use((req, res, next) => {
  res.locals.username = req.session && req.session.username;
  next();
});

// 认证路由（无需登录）
app.use('/login', require('./routes/auth'));

// 其余路由均需认证
const { requireAuth } = require('./middleware/auth');

// 根路径重定向
app.get('/', requireAuth, (req, res) => res.redirect('/dashboard'));

// 仪表盘
app.get('/dashboard', requireAuth, require('./routes/dashboard'));

// 文章管理
const articlesRouter = require('./routes/articles');
app.use('/articles', requireAuth, articlesRouter);

// 分类管理
const categoriesRouter = require('./routes/categories');
app.use('/categories', requireAuth, categoriesRouter);

// 设置
const settingsRouter = require('./routes/settings');
app.use('/settings', requireAuth, settingsRouter);

// 手动构建
app.post('/build', requireAuth, (req, res) => {
  const { exec } = require('child_process');
  exec('node scripts/build.js', { cwd: config.rootDir }, (err, stdout, stderr) => {
    if (err) {
      return res.json({ success: false, error: stderr || err.message });
    }
    res.json({ success: true, output: stdout });
  });
});

// 错误处理
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('服务器内部错误');
});

app.listen(config.port, () => {
  console.log(`APIKnow Admin: http://localhost:${config.port}`);
  console.log(`站点预览:    http://localhost:${config.port}/index.html`);
});
