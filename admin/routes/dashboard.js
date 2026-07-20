const fs = require('fs');
const path = require('path');
const config = require('../config');

module.exports = function(req, res) {
  let articleCount = 0;
  let latestBuild = '未构建';

  // 统计已发布文章
  if (fs.existsSync(config.publishedDir)) {
    articleCount = fs.readdirSync(config.publishedDir).filter(f => f.endsWith('.md')).length;
  }

  // 检查 articles.js 构建时间
  const articlesJsPath = path.join(config.siteDir, 'js', 'articles.js');
  if (fs.existsSync(articlesJsPath)) {
    try {
      const content = fs.readFileSync(articlesJsPath, 'utf-8');
      const m = content.match(/最后构建：(.+)/);
      if (m) latestBuild = new Date(m[1]).toLocaleString('zh-CN');
    } catch (e) {}
  }

  // 统计分类
  let categoryCount = 0;
  if (fs.existsSync(config.categoriesPath)) {
    categoryCount = JSON.parse(fs.readFileSync(config.categoriesPath, 'utf-8')).length;
  }

  // 统计草稿
  let draftCount = 0;
  if (fs.existsSync(config.draftDir)) {
    draftCount = fs.readdirSync(config.draftDir).filter(f => f.endsWith('.md')).length;
  }

  // 最近文章
  let recentArticles = [];
  if (fs.existsSync(config.publishedDir)) {
    const files = fs.readdirSync(config.publishedDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 5);
    recentArticles = files.map(f => {
      const content = fs.readFileSync(path.join(config.publishedDir, f), 'utf-8');
      const titleMatch = content.match(/title:\s*"?(.+?)"?\n/);
      const dateMatch = content.match(/published_at:\s*"?(.+?)"?\n/);
      return {
        slug: f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
        title: titleMatch ? titleMatch[1] : f,
        date: dateMatch ? dateMatch[1] : '',
        file: f
      };
    });
  }

  res.render('dashboard', {
    title: '仪表盘',
    stats: { articleCount, categoryCount, draftCount, latestBuild, providerCount: '15' },
    recentArticles,
    layout: 'layout'
  });
};
