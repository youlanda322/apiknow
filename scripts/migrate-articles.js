/**
 * 迁移脚本：读取 site/js/articles.js 的现有文章数据 → 生成 MD 文件到 content/05-已发布/
 * 仅在首次搭建时运行一次
 * 用法: node scripts/migrate-articles.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARTICLES_JS_PATH = path.join(ROOT, 'site', 'js', 'articles.js');
const OUTPUT_DIR = path.join(ROOT, 'site', 'content', '05-已发布');

// 检查源文件
if (!fs.existsSync(ARTICLES_JS_PATH)) {
  console.error('错误: 未找到 site/js/articles.js');
  process.exit(1);
}

// 确保输出目录存在
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// 读取并执行 articles.js
// articles.js 使用 const 声明，需要特殊处理使其暴露为全局变量
const articlesJsContent = fs.readFileSync(ARTICLES_JS_PATH, 'utf-8');
// 将 const 声明替换为全局赋值（仅用于 eval 环境）
const wrapped = articlesJsContent
  .replace(/const BLOG_CATEGORIES = /g, 'globalThis.BLOG_CATEGORIES = ')
  .replace(/const CONTENT_SERIES = /g, 'globalThis.CONTENT_SERIES = ')
  .replace(/const ARTICLES = /g, 'globalThis.ARTICLES = ');
eval(wrapped);

// 检查是否成功加载
if (!globalThis.ARTICLES) {
  console.error('错误: 未能解析 articles.js 中的 ARTICLES 数组');
  process.exit(1);
}

const ARTICLES = globalThis.ARTICLES;
const BLOG_CATEGORIES = globalThis.BLOG_CATEGORIES || [];
const CONTENT_SERIES = globalThis.CONTENT_SERIES || [];

console.log(`找到 ${ARTICLES.length} 篇文章，开始迁移...\n`);

let count = 0;
ARTICLES.forEach(article => {
  // 构建 YAML frontmatter
  const fmLines = ['---'];
  fmLines.push(`title: "${escapeYaml(article.title)}"`);
  fmLines.push(`slug: "${article.slug}"`);
  fmLines.push(`category: "${article.category}"`);
  fmLines.push(`status: "published"`);
  fmLines.push(`author: "${escapeYaml(article.author || 'APIKnow 编辑部')}"`);
  fmLines.push(`published_at: "${article.date}"`);
  fmLines.push(`updated_at: "${article.updated || article.date}"`);
  fmLines.push(`reading_time: "${article.readTime || '10 分钟'}"`);
  fmLines.push(`level: "${article.level || '入门'}"`);

  if (article.tags && article.tags.length > 0) {
    fmLines.push(`tags:`);
    article.tags.forEach(t => fmLines.push(`  - "${escapeYaml(t)}"`));
  }

  fmLines.push(`sources_checked_at: "${article.date}"`);
  fmLines.push(`commercial_disclosure: "无"`);

  if (article.dek) {
    fmLines.push(`dek: "${escapeYaml(article.dek)}"`);
  }

  if (article.featured) {
    fmLines.push(`featured: true`);
    if (article.points && article.points.length > 0) {
      fmLines.push(`points:`);
      article.points.forEach(p => fmLines.push(`  - ["${escapeYaml(p[0])}", "${escapeYaml(p[1])}"]`));
    }
  }

  if (article.sources && article.sources.length > 0) {
    fmLines.push(`sources:`);
    article.sources.forEach(s => fmLines.push(`  - "${escapeYaml(s)}"`));
  }

  fmLines.push('---');
  fmLines.push('');

  // 构建 MD 正文
  let bodyLines = [];
  if (article.sections && article.sections.length > 0) {
    article.sections.forEach(section => {
      bodyLines.push(`## ${section.title}`);
      bodyLines.push('');

      if (section.paragraphs) {
        section.paragraphs.forEach(p => bodyLines.push(`${p}\n`));
        bodyLines.push('');
      }

      if (section.bullets) {
        section.bullets.forEach(b => bodyLines.push(`- ${b}`));
        bodyLines.push('');
      }

      if (section.code) {
        bodyLines.push('```' + section.code.lang);
        bodyLines.push(section.code.value);
        bodyLines.push('```');
        bodyLines.push('');
      }

      if (section.note) {
        bodyLines.push(`> 注意：${section.note}`);
        bodyLines.push('');
      }
    });
  }

  if (article.sources && article.sources.length > 0) {
    bodyLines.push('## 参考资料');
    bodyLines.push('');
    article.sources.forEach((s, i) => bodyLines.push(`${i + 1}. ${s}`));
    bodyLines.push('');
  }

  // 写入文件
  const filename = `${article.date}-${article.slug}.md`;
  const content = fmLines.join('\n') + '\n' + bodyLines.join('\n');
  const outputPath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✓ ${filename} (${article.title})`);
  count++;
});

console.log(`\n迁移完成: ${count} 篇文章 → ${OUTPUT_DIR}`);
console.log('接下来运行: npm run build 重新生成 articles.js');

function escapeYaml(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
