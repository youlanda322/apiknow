/**
 * 构建脚本：读取 content/05-已发布/*.md → 生成 site/js/articles.js
 * 用法: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: false,
});

// 路径
const ROOT = path.join(__dirname, '..');
const PUBLISHED_DIR = path.join(ROOT, 'site', 'content', '05-已发布');
const CATEGORIES_PATH = path.join(ROOT, 'admin', 'data', 'categories.json');
const SERIES_PATH = path.join(ROOT, 'admin', 'data', 'series.json');
const OUTPUT_PATH = path.join(ROOT, 'site', 'js', 'articles.js');

// 读取分类
let categories;
try {
  categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf-8'));
  console.log(`读取分类: ${categories.length} 个`);
} catch (e) {
  console.warn('警告: 未找到 categories.json，使用空数组');
  categories = [];
}

// 读取专题系列
let series;
try {
  series = JSON.parse(fs.readFileSync(SERIES_PATH, 'utf-8'));
  console.log(`读取系列: ${series.length} 个`);
} catch (e) {
  console.warn('警告: 未找到 series.json，使用空数组');
  series = [];
}

// 读取所有已发布MD文件
if (!fs.existsSync(PUBLISHED_DIR)) {
  console.error('错误: content/05-已发布/ 目录不存在');
  console.log('将生成空的 articles.js');
  fs.writeFileSync(OUTPUT_PATH, generateOutput([], categories, series));
  process.exit(0);
}

const mdFiles = fs.readdirSync(PUBLISHED_DIR).filter(f => f.endsWith('.md'));
console.log(`找到 ${mdFiles.length} 个 MD 文件`);

// 解析每篇文章
const articles = mdFiles.map(file => {
  const raw = fs.readFileSync(path.join(PUBLISHED_DIR, file), 'utf-8');
  const { data: fm, content: body } = matter(raw);
  const bodyHtml = marked.parse(body);

  // 提取 h2 标题作为来源信息
  const slug = fm.slug || file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');

  return {
    slug: slug,
    category: fm.category || 'fundamentals',
    title: fm.title || '未命名',
    dek: fm.dek || fm.description || '',
    date: fm.published_at || fm.date || '',
    updated: fm.updated_at || fm.updated || fm.date || '',
    readTime: fm.reading_time || fm.readTime || '10 分钟',
    level: fm.level || '入门',
    author: fm.author || 'APIKnow 编辑部',
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    featured: fm.featured === true || fm.featured === 'true',
    points: Array.isArray(fm.points) ? fm.points : null,
    bodyHtml: bodyHtml,
    sources: Array.isArray(fm.sources) ? fm.sources : [],
  };
}).sort((a, b) => b.date.localeCompare(a.date));

console.log(`解析完成: ${articles.length} 篇文章`);

// 生成 articles.js
fs.writeFileSync(OUTPUT_PATH, generateOutput(articles, categories, series));
console.log(`构建完成 → ${OUTPUT_PATH}`);

function generateOutput(articles, categories, series) {
  return `// 此文件由 scripts/build.js 自动生成，请勿手动编辑
// 源文件：site/content/05-已发布/*.md
// 最后构建：${new Date().toISOString()}
// 文章数：${articles.length}

const BLOG_CATEGORIES = ${JSON.stringify(categories, null, 2)};

const CONTENT_SERIES = ${JSON.stringify(series, null, 2)};

const ARTICLES = ${JSON.stringify(articles, null, 2)};
`;
}
