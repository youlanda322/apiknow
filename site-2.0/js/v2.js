function v2Escape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initV2Shell() {
  const button = document.querySelector("[data-menu]");
  const nav = document.querySelector("[data-nav]");
  button?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });
  if (window.lucide) window.lucide.createIcons();
}

function gradeMeta(score) {
  return GRADE_RULES.find((rule) => score >= rule.min) || GRADE_RULES.at(-1);
}

function refundBadgeClass(policy) {
  if (policy === "支持退款") return "badge badge-green";
  if (policy === "部分退款") return "badge badge-amber";
  return "badge badge-red";
}

function purityBadgeClass(status) {
  if (status === "已检测·未掺水") return "badge badge-green";
  if (status === "已检测·待复核") return "badge badge-amber";
  return "badge badge-gray";
}

function stationCard(station, rank) {
  const grade = gradeMeta(station.score);
  return `
    <article class="station-card">
      <div class="station-rank">${String(rank + 1).padStart(2, "0")}</div>
      <div class="station-main">
        <div class="station-head">
          <div><span class="demo-label">${station.evidenceStatus}</span><h3>${station.name}</h3></div>
          <div class="score-badge" style="--grade:${grade.color}"><strong>${station.score}</strong><span>${station.grade}</span></div>
        </div>
        <p>${station.summary}</p>
        <div class="badge-row">
          <span class="${refundBadgeClass(station.refundPolicy)}">${station.refundPolicy}</span>
          <span class="${purityBadgeClass(station.purityTest)}">${station.purityTest}</span>
        </div>
        <div class="tag-list">${station.tags.slice(0, 4).map((tag) => `<span>${tag}</span>`).join("")}</div>
        <div class="station-foot"><span>更新 ${station.updated}</span><a href="station.html?id=${station.id}">查看评分证据 →</a></div>
      </div>
    </article>`;
}

function uniqueArticles() {
  if (typeof ARTICLES === "undefined") return [];
  const seen = new Set();
  return ARTICLES.filter((article) => {
    if (seen.has(article.slug)) return false;
    seen.add(article.slug);
    return true;
  });
}

function v2CategoryLabel(id) {
  if (typeof BLOG_CATEGORIES === "undefined") return id;
  return BLOG_CATEGORIES.find((item) => item.id === id)?.label || id;
}

function articleCardV2(article) {
  return `
    <a class="story-card" href="article.html?slug=${encodeURIComponent(article.slug)}">
      <div class="story-meta"><span>${v2Escape(v2CategoryLabel(article.category))}</span><span>${v2Escape(article.readTime)}</span></div>
      <h3>${v2Escape(article.title)}</h3>
      <p>${v2Escape(article.dek)}</p>
      <div class="tag-list">${(article.tags || []).slice(0, 4).map((tag) => `<span>${v2Escape(tag)}</span>`).join("")}</div>
    </a>`;
}

function initV2Home() {
  const stationRoot = document.querySelector("[data-home-stations]");
  if (stationRoot) stationRoot.innerHTML = [...STATIONS].sort((a, b) => b.score - a.score).slice(0, 3).map(stationCard).join("");
  const articleRoot = document.querySelector("[data-home-articles]");
  if (articleRoot) articleRoot.innerHTML = uniqueArticles().slice(0, 6).map(articleCardV2).join("");
}

function initStationList() {
  const root = document.querySelector("[data-station-list]");
  if (!root) return;
  const filterRoot = document.querySelector("[data-usecase-filters]");
  const search = document.querySelector("[data-station-search]");
  const status = document.querySelector("[data-station-count]");
  const useCases = [...new Set(STATIONS.flatMap((station) => station.useCases))];
  let active = "全部";
  filterRoot.innerHTML = ["全部", ...useCases].map((item) => `<button type="button" class="chip-button ${item === active ? "active" : ""}" data-usecase="${item}">${item}</button>`).join("");

  function render() {
    const query = search.value.trim().toLowerCase();
    const list = STATIONS.filter((station) => {
      const useCaseMatch = active === "全部" || station.useCases.includes(active);
      const text = [station.name, station.summary, ...station.tags, ...station.models].join(" ").toLowerCase();
      return useCaseMatch && (!query || text.includes(query));
    }).sort((a, b) => b.score - a.score);
    root.innerHTML = list.map(stationCard).join("") || `<div class="empty"><strong>没有匹配站点</strong><p>更换关键词或场景继续筛选。</p></div>`;
    status.textContent = `共 ${list.length} 个站点条目`;
  }
  filterRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-usecase]");
    if (!button) return;
    active = button.dataset.usecase;
    filterRoot.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
  search.addEventListener("input", render);
  render();
}

function initMethodology() {
  const model = document.querySelector("[data-score-model]");
  if (model) model.innerHTML = SCORE_MODEL.map((item, index) => `
    <div class="method-row"><span class="method-index">${String(index + 1).padStart(2, "0")}</span><div><strong>${item.label}</strong><p>${item.desc}</p></div><span class="method-weight">${item.weight} 分</span></div>
  `).join("");
  const grades = document.querySelector("[data-grade-rules]");
  if (grades) grades.innerHTML = GRADE_RULES.map((item) => `<div class="grade-item" style="--grade:${item.color}"><strong>${item.grade}</strong><span>${item.min}+ 分</span><small>${item.label}</small></div>`).join("");
  const hard = document.querySelector("[data-hard-rules]");
  if (hard) hard.innerHTML = HARD_RULES.map((item) => `<li>${item}</li>`).join("");
}

function initStationDetail() {
  const root = document.querySelector("[data-station-detail]");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const station = STATIONS.find((item) => item.id === id) || STATIONS[0];
  const grade = gradeMeta(station.score);
  document.title = `${station.name}评分详情 - APIKnow 2.0`;
  root.innerHTML = `
    <div class="detail-intro">
      <div><span class="demo-label">${station.evidenceStatus}</span><h1>${station.name}</h1><p>${station.summary}</p><div class="badge-row"><span class="${refundBadgeClass(station.refundPolicy)}">${station.refundPolicy}</span><span class="${purityBadgeClass(station.purityTest)}">${station.purityTest}</span><span class="badge badge-blue">${station.latencyData}</span></div><div class="tag-list">${station.tags.map((tag) => `<span>${tag}</span>`).join("")}</div></div>
      <div class="hero-score" style="--grade:${grade.color}"><strong>${station.score}</strong><span>${station.grade} · ${grade.label}</span></div>
    </div>
    <div class="detail-grid">
      <section><h2>分项得分</h2><div class="score-list">${SCORE_MODEL.map((item) => {
        const score = station.scores[item.id];
        return `<div class="score-row"><div><strong>${item.label}</strong><span>${score} / ${item.weight}</span></div><div class="score-track"><i style="width:${score / item.weight * 100}%"></i></div></div>`;
      }).join("")}</div></section>
      <aside class="fact-panel"><h2>核验信息</h2>${station.facts.map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`).join("")}</aside>
    </div>
    <div class="pros-cons"><section><h2>优势</h2><ul>${station.strengths.map((item) => `<li>${item}</li>`).join("")}</ul></section><section><h2>风险与待复核</h2><ul>${station.risks.map((item) => `<li>${item}</li>`).join("")}</ul></section></div>
    <aside class="demo-warning"><strong>发布前要求</strong>当前为评分体系演示数据。替换为真实站点时，必须附测试记录、官方页面、核验日期、商业关系与风险证据。</aside>`;
}

function initV2Articles() {
  const root = document.querySelector("[data-v2-articles]");
  if (!root) return;
  const articles = uniqueArticles();
  const tags = [...new Set(articles.flatMap((article) => article.tags || []))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  const tagRoot = document.querySelector("[data-tag-filters]");
  const search = document.querySelector("[data-article-search]");
  const count = document.querySelector("[data-article-count]");
  const requestedTag = new URLSearchParams(location.search).get("tag");
  let activeTag = requestedTag || "全部";
  const visibleTags = tags.slice(0, 24);
  if (requestedTag && !visibleTags.includes(requestedTag)) visibleTags.unshift(requestedTag);
  tagRoot.innerHTML = ["全部", ...visibleTags].map((tag) => `<button class="chip-button ${tag === activeTag ? "active" : ""}" type="button" data-tag="${v2Escape(tag)}">${v2Escape(tag)}</button>`).join("");
  function render() {
    const query = search.value.trim().toLowerCase();
    const list = articles.filter((article) => {
      const tagMatch = activeTag === "全部" || (article.tags || []).includes(activeTag);
      const text = [article.title, article.dek, ...(article.tags || [])].join(" ").toLowerCase();
      return tagMatch && (!query || text.includes(query));
    });
    root.innerHTML = list.map(articleCardV2).join("") || `<div class="empty"><strong>没有匹配文章</strong><p>更换关键词或标签继续筛选。</p></div>`;
    count.textContent = `共 ${list.length} 篇文章`;
  }
  tagRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag]");
    if (!button) return;
    activeTag = button.dataset.tag;
    tagRoot.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
  search.addEventListener("input", render);
  render();
}

function initV2ArticleDetail() {
  const root = document.querySelector("[data-v2-article]");
  if (!root) return;
  const slug = new URLSearchParams(location.search).get("slug");
  const article = uniqueArticles().find((item) => item.slug === slug) || uniqueArticles()[0];
  document.title = `${article.title} - APIKnow 2.0`;
  const content = article.bodyHtml || (article.sections || []).map((section) => `<h2 id="${section.id}">${section.title}</h2>${(section.paragraphs || []).map((p) => `<p>${p}</p>`).join("")}${section.bullets ? `<ul>${section.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}`).join("");
  root.innerHTML = `<header class="story-head"><div class="tag-list">${(article.tags || []).map((tag) => `<a href="articles.html?tag=${encodeURIComponent(tag)}">${v2Escape(tag)}</a>`).join("")}</div><h1>${article.title}</h1><p>${article.dek}</p><div class="story-byline">${article.author} · ${article.updated} · ${article.readTime}</div></header><div class="prose">${content}</div>`;
}

function initEditor() {
  const form = document.querySelector("[data-editor-form]");
  if (!form) return;
  const storageKey = "apiknow-v2-draft";
  const tagInput = form.querySelector("[data-tag-input]");
  const tagRoot = form.querySelector("[data-editor-tags]");
  const popular = document.querySelector("[data-popular-tags]");
  const output = document.querySelector("[data-editor-output]");
  const preview = document.querySelector("[data-editor-preview]");
  const allTags = [...new Set(uniqueArticles().flatMap((article) => article.tags || []))].slice(0, 20);
  let tags = [];

  function drawTags() {
    tagRoot.innerHTML = tags.map((tag) => `<button type="button" data-remove-tag="${v2Escape(tag)}">${v2Escape(tag)} <span>×</span></button>`).join("");
  }
  function addTag(raw) {
    const tag = raw.trim().replace(/^#/, "");
    if (tag && !tags.includes(tag)) tags.push(tag);
    tagInput.value = "";
    drawTags();
    update();
  }
  popular.innerHTML = allTags.map((tag) => `<button type="button" data-popular-tag="${v2Escape(tag)}">${v2Escape(tag)}</button>`).join("");
  tagInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(tagInput.value); }
  });
  tagInput.addEventListener("blur", () => { if (tagInput.value.trim()) addTag(tagInput.value); });
  tagRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-tag]");
    if (!button) return;
    tags = tags.filter((tag) => tag !== button.dataset.removeTag);
    drawTags(); update();
  });
  popular.addEventListener("click", (event) => {
    const button = event.target.closest("[data-popular-tag]");
    if (button) addTag(button.dataset.popularTag);
  });

  function values() {
    return Object.fromEntries(new FormData(form).entries());
  }
  function markdown() {
    const data = values();
    const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
    return `---\ntitle: "${data.title || ""}"\nslug: "${data.slug || ""}"\ncategory: "${data.category || "fundamentals"}"\ntype: "${data.type || "深度解析"}"\nstatus: "draft"\ntags: [${tags.map((tag) => `"${tag}"`).join(", ")}]\nupdated_at: "${localDate}"\ncommercial_disclosure: "${data.disclosure || "无"}"\n---\n\n# ${data.title || "文章标题"}\n\n> ${data.dek || "文章摘要"}\n\n## 先给结论\n\n${data.conclusion || "写出三到五条可验证结论。"}\n\n## 问题与边界\n\n## 方法、证据或实现\n\n## 风险与限制\n\n## 参考资料\n`;
  }
  function update() {
    const data = values();
    output.value = markdown();
    preview.innerHTML = `<span>${v2Escape(data.category || "栏目")}</span><h3>${v2Escape(data.title || "文章标题预览")}</h3><p>${v2Escape(data.dek || "摘要会显示在文章卡片中。")}</p><div class="tag-list">${tags.map((tag) => `<i>${v2Escape(tag)}</i>`).join("")}</div>`;
    localStorage.setItem(storageKey, JSON.stringify({ data, tags }));
  }
  form.addEventListener("input", update);
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const state = JSON.parse(saved);
      Object.entries(state.data || {}).forEach(([name, value]) => { const field = form.elements.namedItem(name); if (field) field.value = value; });
      tags = state.tags || [];
    } catch (_) {}
  }
  document.querySelector("[data-copy-markdown]").addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    document.querySelector("[data-copy-markdown]").textContent = "已复制";
  });
  document.querySelector("[data-download-markdown]").addEventListener("click", () => {
    const blob = new Blob([output.value], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${values().slug || "article-draft"}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
  document.querySelector("[data-clear-draft]").addEventListener("click", () => {
    form.reset(); tags = []; localStorage.removeItem(storageKey); drawTags(); update();
  });
  drawTags(); update();
}

document.addEventListener("DOMContentLoaded", () => {
  initV2Shell();
  initV2Home();
  initStationList();
  initMethodology();
  initStationDetail();
  initV2Articles();
  initV2ArticleDetail();
  initEditor();
});
