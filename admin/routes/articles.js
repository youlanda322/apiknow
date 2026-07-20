/**
 * 文章管理路由
 * 文章以 MD 文件形式存储在 content/ 各子目录中
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const matter = require('gray-matter');
const config = require('../config');

const router = express.Router();

// 文章列表
router.get('/', (req, res) => {
  const statusFilter = req.query.status || 'all';
  let articles = [];

  // 从各目录读取文章
  const dirs = {
    'published': config.publishedDir,
    'draft': config.draftDir,
    'review': config.reviewDir,
  };

  Object.entries(dirs).forEach(([status, dir]) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    files.forEach(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const { data: fm } = matter(raw);
      articles.push({
        slug: f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
        file: f,
        title: fm.title || '无标题',
        category: fm.category || '',
        status: status,
        date: fm.published_at || '',
        level: fm.level || '',
        featured: fm.featured === true,
      });
    });
  });

  // 按状态筛选
  if (statusFilter !== 'all') {
    articles = articles.filter(a => a.status === statusFilter);
  }

  // 按日期排序
  articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  res.render('articles/list', {
    title: '文章管理',
    articles,
    statusFilter,
    layout: 'layout'
  });
});

// 新建文章页面
router.get('/new', (req, res) => {
  res.render('articles/edit', {
    title: '新建文章',
    article: null,
    categories: getCategories(),
    layout: 'layout',
    isNew: true
  });
});

// 编辑文章页面
router.get('/:slug/edit', (req, res) => {
  const { slug } = req.params;

  // 在所有目录中查找文章
  const dirs = [
    { status: 'published', path: config.publishedDir },
    { status: 'draft', path: config.draftDir },
    { status: 'review', path: config.reviewDir },
  ];

  let found = null;

  for (const d of dirs) {
    if (!fs.existsSync(d.path)) continue;
    const files = fs.readdirSync(d.path).filter(f => f.endsWith('.md'));
    const match = files.find(f => {
      const s = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      return s === slug;
    });
    if (match) {
      found = { file: match, dir: d.path, status: d.status };
      break;
    }
  }

  if (!found) {
    return res.status(404).send('文章不存在');
  }

  const raw = fs.readFileSync(path.join(found.dir, found.file), 'utf-8');
  const { data: fm, content: body } = matter(raw);

  res.render('articles/edit', {
    title: '编辑文章',
    article: {
      slug,
      file: found.file,
      status: found.status,
      body: body,
      title: fm.title || '',
      category: fm.category || '',
      level: fm.level || '入门',
      tags: Array.isArray(fm.tags) ? fm.tags.join(', ') : '',
      dek: fm.dek || '',
      author: fm.author || 'APIKnow 编辑部',
      readingTime: fm.reading_time || '10 分钟',
      featured: fm.featured === true,
    },
    categories: getCategories(),
    layout: 'layout',
    isNew: false
  });
});

// 保存文章（新建）
router.post('/', (req, res) => {
  const { title, slug, category, status, body } = req.body;
  if (!title || !slug || !body) {
    return res.status(400).send('标题、slug 和正文为必填');
  }

  const today = new Date().toISOString().split('T')[0];
  const filename = `${today}-${slug}.md`;

  // 生成 frontmatter
  const fm = buildFrontmatter(req.body);
  const content = fm + '\n' + body;

  // 根据状态存到不同目录
  const targetDir = getDirByStatus(status || 'draft');
  fs.writeFileSync(path.join(targetDir, filename), content, 'utf-8');

  // 触发构建
  runBuild();

  res.redirect('/articles');
});

// 更新文章
router.post('/:slug', (req, res) => {
  const { slug } = req.params;

  // 找到原文件
  const dirs = [
    { status: 'published', path: config.publishedDir },
    { status: 'draft', path: config.draftDir },
    { status: 'review', path: config.reviewDir },
  ];

  let found = null;
  for (const d of dirs) {
    if (!fs.existsSync(d.path)) continue;
    const files = fs.readdirSync(d.path).filter(f => f.endsWith('.md'));
    const match = files.find(f => {
      const s = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      return s === slug;
    });
    if (match) {
      found = { file: match, dir: d.path, status: d.status };
      break;
    }
  }

  if (!found) {
    return res.status(404).send('文章不存在');
  }

  // 用 gray-matter 解析旧 frontmatter
  const raw = fs.readFileSync(path.join(found.dir, found.file), 'utf-8');
  const { data: oldFm } = matter(raw);

  // 合并旧 frontmatter 和新表单数据
  const newFm = buildFrontmatter({ ...oldFm, ...req.body });
  const { body } = req.body;
  const newContent = newFm + '\n' + body;

  // 如果状态改变，移动到新目录
  const newStatus = req.body.status || found.status;
  const targetDir = getDirByStatus(newStatus);

  if (found.status !== newStatus) {
    fs.unlinkSync(path.join(found.dir, found.file));
    fs.writeFileSync(path.join(targetDir, found.file), newContent, 'utf-8');
  } else {
    fs.writeFileSync(path.join(found.dir, found.file), newContent, 'utf-8');
  }

  // 触发构建
  runBuild();

  res.redirect('/articles');
});

// 删除文章
router.post('/:slug/delete', (req, res) => {
  const { slug } = req.params;
  const dirs = [
    config.publishedDir, config.draftDir, config.reviewDir
  ];

  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    const files = fs.readdirSync(d).filter(f => f.endsWith('.md'));
    const match = files.find(f => {
      const s = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      return s === slug;
    });
    if (match) {
      // 移到归档目录
      const archiveDir = path.join(config.contentDir, '09-归档');
      if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
      fs.renameSync(path.join(d, match), path.join(archiveDir, match + '.archived'));
      runBuild();
      return res.redirect('/articles');
    }
  }
  res.status(404).send('文章不存在');
});

function getCategories() {
  try {
    return JSON.parse(fs.readFileSync(config.categoriesPath, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function getDirByStatus(status) {
  const map = {
    'published': config.publishedDir,
    'draft': config.draftDir,
    'review': config.reviewDir,
  };
  const dir = map[status] || config.draftDir;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function buildFrontmatter(data) {
  const lines = ['---'];
  if (data.title) lines.push(`title: "${data.title.replace(/"/g, '\\"')}"`);
  if (data.slug) lines.push(`slug: "${data.slug}"`);
  if (data.category) lines.push(`category: "${data.category}"`);
  lines.push(`status: "${data.status || 'draft'}"`);
  lines.push(`author: "${data.author || 'APIKnow 编辑部'}"`);
  lines.push(`published_at: "${data.published_at || new Date().toISOString().split('T')[0]}"`);
  lines.push(`updated_at: "${data.updated_at || new Date().toISOString().split('T')[0]}"`);
  lines.push(`reading_time: "${data.reading_time || '10 分钟'}"`);
  lines.push(`level: "${data.level || '入门'}"`);
  if (data.tags) {
    const tags = typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()) : data.tags;
    lines.push('tags:');
    tags.forEach(t => lines.push(`  - "${t}"`));
  }
  lines.push(`sources_checked_at: "${data.sources_checked_at || new Date().toISOString().split('T')[0]}"`);
  lines.push(`commercial_disclosure: "${data.commercial_disclosure || '无'}"`);
  if (data.dek) lines.push(`dek: "${data.dek.replace(/"/g, '\\"')}"`);
  if (data.featured === 'true' || data.featured === true) lines.push('featured: true');
  if (data.points) {
    lines.push('points:');
    const pts = typeof data.points === 'string' ? JSON.parse(data.points) : data.points;
    if (Array.isArray(pts)) pts.forEach(p => {
      if (Array.isArray(p)) lines.push(`  - ["${p[0]}", "${p[1]}"]`);
    });
  }
  if (data.sources) {
    const srcs = typeof data.sources === 'string' ? data.sources.split('\n').filter(Boolean) : data.sources;
    lines.push('sources:');
    srcs.forEach(s => lines.push(`  - "${s.trim().replace(/"/g, '\\"')}"`));
  }
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

function runBuild() {
  exec(`node "${path.join(config.rootDir, 'scripts', 'build.js')}"`, { cwd: config.rootDir }, (err, stdout, stderr) => {
    if (err) console.error('构建失败:', stderr);
    else console.log('构建完成:', stdout.trim());
  });
}

module.exports = router;
