function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryLabel(id) {
  return BLOG_CATEGORIES.find((item) => item.id === id)?.label || id;
}

function articleUrl(article) {
  return `article.html?slug=${encodeURIComponent(article.slug)}`;
}

function renderArticleCard(article) {
  return `
    <a class="article-card" href="${articleUrl(article)}">
      <div class="card-top">
        <span class="category-pill" data-category="${article.category}">${categoryLabel(article.category)}</span>
        <span class="read-time">${article.readTime}</span>
      </div>
      <h3>${article.title}</h3>
      <p>${article.dek}</p>
      <div class="card-footer">${article.date} · ${article.level}</div>
    </a>`;
}

function initShell() {
  const menuButton = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-main-nav]");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

function initHome() {
  const featured = ARTICLES.find((article) => article.featured) || ARTICLES[0];
  const featuredTitle = document.querySelector("[data-featured-title]");
  const featuredDek = document.querySelector("[data-featured-dek]");
  const featuredMeta = document.querySelector("[data-featured-meta]");
  const featuredLink = document.querySelector("[data-featured-link]");
  const featurePoints = document.querySelector("[data-feature-points]");

  if (featuredTitle) featuredTitle.textContent = featured.title;
  if (featuredDek) featuredDek.textContent = featured.dek;
  if (featuredMeta) featuredMeta.textContent = `${featured.date} · ${featured.readTime} · ${featured.level}`;
  if (featuredLink) featuredLink.href = articleUrl(featured);
  if (featurePoints) {
    featurePoints.innerHTML = featured.points.map(([title, desc]) => `
      <div class="feature-point"><strong>${title}</strong><span>${desc}</span></div>
    `).join("");
  }

  const latestGrid = document.querySelector("[data-latest-grid]");
  if (latestGrid) latestGrid.innerHTML = ARTICLES.filter((item) => !item.featured).slice(0, 6).map(renderArticleCard).join("");

  const seriesList = document.querySelector("[data-series-list]");
  if (seriesList) {
    seriesList.innerHTML = CONTENT_SERIES.map((series) => `
      <a class="series-row" href="articles.html?category=${series.category}">
        <span class="series-index">${series.index}</span>
        <span><h3>${series.title}</h3><p>${series.desc}</p></span>
        <span class="series-count">${series.count} 篇规划</span>
      </a>
    `).join("");
  }
}

function initArticleIndex() {
  const grid = document.querySelector("[data-article-grid]");
  const filters = document.querySelector("[data-filters]");
  const input = document.querySelector("[data-article-search]");
  const resultNote = document.querySelector("[data-result-note]");
  if (!grid || !filters || !input) return;

  const params = new URLSearchParams(window.location.search);
  let activeCategory = params.get("category") || "all";
  if (!["all", ...BLOG_CATEGORIES.map((item) => item.id)].includes(activeCategory)) activeCategory = "all";

  filters.innerHTML = [
    { id: "all", label: "全部文章" },
    ...BLOG_CATEGORIES
  ].map((category) => `
    <button class="filter-button ${category.id === activeCategory ? "active" : ""}" type="button" data-category="${category.id}">${category.label}</button>
  `).join("");

  function render() {
    const query = input.value.trim().toLowerCase();
    const list = ARTICLES.filter((article) => {
      const categoryMatch = activeCategory === "all" || article.category === activeCategory;
      const haystack = [article.title, article.dek, article.tags.join(" ")].join(" ").toLowerCase();
      return categoryMatch && (!query || haystack.includes(query));
    });
    grid.innerHTML = list.length
      ? list.map(renderArticleCard).join("")
      : `<div class="empty-state"><strong>没有找到匹配文章</strong><p>换一个关键词或栏目继续查找。</p></div>`;
    if (resultNote) resultNote.textContent = `共 ${list.length} 篇深度文章`;
    if (window.lucide) window.lucide.createIcons();
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    filters.querySelectorAll(".filter-button").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
  input.addEventListener("input", render);
  render();
}

function renderSection(section) {
  const paragraphs = (section.paragraphs || []).map((paragraph) => `<p>${paragraph}</p>`).join("");
  const bullets = section.bullets?.length
    ? `<ul>${section.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "";
  const code = section.code
    ? `<div class="code-block"><div class="code-head"><span>${section.code.lang}</span><span>示例</span></div><pre><code>${escapeHtml(section.code.value)}</code></pre></div>`
    : "";
  const note = section.note
    ? `<aside class="article-note"><strong>注意</strong>${section.note}</aside>`
    : "";
  return `<section><h2 id="${section.id}">${section.title}</h2>${paragraphs}${bullets}${code}${note}</section>`;
}

function initArticlePage() {
  const root = document.querySelector("[data-article-root]");
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const article = ARTICLES.find((item) => item.slug === params.get("slug")) || ARTICLES[0];
  document.title = `${article.title} - APIKnow`;

  const header = document.querySelector("[data-article-header]");
  const body = document.querySelector("[data-article-body]");
  const toc = document.querySelector("[data-toc]");
  if (header) {
    header.innerHTML = `
      <span class="category-pill" data-category="${article.category}">${categoryLabel(article.category)}</span>
      <h1>${article.title}</h1>
      <p class="article-dek">${article.dek}</p>
      <div class="article-meta"><span>${article.author}</span><span>发布 ${article.date}</span><span>更新 ${article.updated}</span><span>${article.readTime}</span><span>${article.level}</span></div>`;
  }
  if (body) {
    if (article.bodyHtml) {
      // 新格式：使用构建生成的完整 HTML
      body.innerHTML = article.bodyHtml + `
      <section class="article-sources"><h2>参考与核验方向</h2><ol class="source-list">${(article.sources || []).map((item) => `<li>${item}</li>`).join("")}</ol></section>
      <div class="article-end"><p><strong>编辑说明：</strong>本文关注可复用的工程方法。涉及服务商价格、限额和产品能力时，应以其最新官方文档为准，并记录核验日期。</p></div>`;
    } else if (article.sections) {
      // 旧格式：使用 sections 结构化渲染（兼容）
      body.innerHTML = article.sections.map(renderSection).join("") + `
      <section class="article-sources"><h2>参考与核验方向</h2><ol class="source-list">${article.sources.map((item) => `<li>${item}</li>`).join("")}</ol></section>
      <div class="article-end"><p><strong>编辑说明：</strong>本文关注可复用的工程方法。涉及服务商价格、限额和产品能力时，应以其最新官方文档为准，并记录核验日期。</p></div>`;
    }
  }
  if (toc) {
    // 从渲染后的 body HTML 生成 TOC（同时兼容新旧格式）
    const tocHeadings = body.querySelectorAll('h2');
    if (tocHeadings.length > 0) {
      toc.innerHTML = `<strong>本文目录</strong>` +
        [...tocHeadings].map(h => {
          const id = h.id || h.textContent.replace(/[^\w\u4e00-\u9fff]/g, '-').toLowerCase();
          h.id = id;
          return `<a href="#${id}">${h.textContent.replace(/^\d+\.\s*/, '')}</a>`;
        }).join('');
    }
  }

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", article.dek);

  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.dek,
    datePublished: article.date,
    dateModified: article.updated,
    author: { "@type": "Organization", name: article.author },
    publisher: { "@type": "Organization", name: "APIKnow" }
  };
  const schemaNode = document.createElement("script");
  schemaNode.type = "application/ld+json";
  schemaNode.textContent = JSON.stringify(schema);
  document.head.appendChild(schemaNode);

  const progress = document.querySelector("[data-reading-progress]");
  const tocLinks = [...document.querySelectorAll(".toc a")];
  const headings = body ? [...body.querySelectorAll("h2")].filter(Boolean) : [];
  window.addEventListener("scroll", () => {
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
    }
    let current = headings[0]?.id;
    for (const heading of headings) if (heading.getBoundingClientRect().top <= 130) current = heading.id;
    tocLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  }, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initShell();
  initHome();
  initArticleIndex();
  initArticlePage();
});
