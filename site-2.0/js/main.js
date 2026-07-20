/* ========================================================
   APIKnow - 全局 JS (main.js)
   ======================================================== */

// 导航高亮
function initNavHighlight() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').replace('./', 'index.html');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// 渲染状态徽章
function renderStatusBadges(statusKeys) {
  return statusKeys.map(k => {
    const cfg = STATUS_CONFIG[k];
    if (!cfg) return '';
    return `<span class="badge ${cfg.cls}">${cfg.icon} ${cfg.label}</span>`;
  }).join('');
}

// 渲染 provider 卡片
function renderProviderCard(p, opts = {}) {
  const priceDisplay = p.category === 'drawing'
    ? `<span class="value">${p.pricing.currency === 'USD' ? '$' : '¥'}${p.pricing.textToImg}</span><span class="unit">/张</span>`
    : p.category === 'llm'
      ? `<span class="value">${p.pricing.currency === 'USD' ? '$' : '¥'}${p.pricing.inputPer1M}</span><span class="unit">/1M tokens</span>`
      : `<span class="value">${p.pricing.currency === 'USD' ? '$' : '¥'}${p.pricing.ttsPer1K}</span><span class="unit">/1K字符</span>`;

  const latencyDot = parseFloat(p.latency.cn) < 100 ? 'background:#4a7c59;'
    : parseFloat(p.latency.cn) < 200 ? 'background:#c9a84c;'
    : parseFloat(p.latency.cn) < 300 ? 'background:#c9892e;'
    : 'background:#a94442;';

  const featured = opts.featured ? 'card-featured' : '';
  const tags = (p.tags || []).slice(0, 4).map(t => `<span class="card-tag">${t}</span>`).join('');

  return `
    <div class="card ${featured} animate-fade-in">
      <div class="card-header">
        <div class="card-brand">
          <div class="card-logo">${p.logo}</div>
          <div>
            <div class="card-title">${p.name}</div>
            <div class="card-subtitle">${p.categoryLabel}</div>
          </div>
        </div>
        <div class="card-badges">${renderStatusBadges(p.statusKeys)}</div>
      </div>
      <div class="card-body">
        <div class="card-price">${priceDisplay}</div>
        <div class="card-desc truncate-3">${p.description}</div>
        <div class="card-meta">
          <div class="card-meta-item"><span class="dot" style="${latencyDot}"></span> 延迟 ${p.latency.cn}</div>
          <div class="card-meta-item">&#128161; ${p.models.slice(0, 2).join('、')}${p.models.length > 2 ? '...' : ''}</div>
          <div class="card-meta-item">&#9733; ${p.rating}</div>
        </div>
        ${tags ? `<div class="card-tags">${tags}</div>` : ''}
      </div>
      <div class="card-footer">
        <span class="card-rating"><span class="stars">${'★'.repeat(Math.floor(p.rating))}${p.rating % 1 >= 0.5 ? '½' : ''}</span> ${p.rating}</span>
        <div class="card-actions">
          <a href="${p.url}" target="_blank" class="card-btn">官网</a>
          <a href="comparison.html?provider=${p.id}" class="card-btn card-btn-primary">比价</a>
        </div>
      </div>
    </div>
  `;
}

// 渲染精选推荐
function initFeaturedSection() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = providers.filter(p => p.rating >= 4.3).slice(0, 3);
  grid.innerHTML = featured.map(p => renderProviderCard(p, { featured: true })).join('');
}

// 首页筛选和搜索
function initHomeFilter() {
  const grid = document.getElementById('providerGrid');
  const countEl = document.getElementById('resultsCount');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const statusFilter = document.getElementById('statusFilter');
  const sortFilter = document.getElementById('sortFilter');

  if (!grid) return;

  function apply() {
    let list = [...providers];

    // 搜索
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.models.some(m => m.toLowerCase().includes(q)) || (p.tags || []).some(t => t.toLowerCase().includes(q)));

    // 分类
    const cat = categoryFilter ? categoryFilter.value : 'all';
    if (cat !== 'all') list = list.filter(p => p.category === cat);

    // 状态
    const status = statusFilter ? statusFilter.value : 'all';
    if (status !== 'all') list = list.filter(p => p.statusKeys.includes(status));

    // 排序
    const sort = sortFilter ? sortFilter.value : 'default';
    if (sort === 'price-asc') {
      list.sort((a, b) => {
        const pa = a.category === 'drawing' ? a.pricing.textToImg : a.category === 'llm' ? a.pricing.inputPer1M : a.pricing.ttsPer1K;
        const pb = b.category === 'drawing' ? b.pricing.textToImg : b.category === 'llm' ? b.pricing.inputPer1M : b.pricing.ttsPer1K;
        return pa - pb;
      });
    } else if (sort === 'price-desc') {
      list.sort((a, b) => {
        const pa = a.category === 'drawing' ? a.pricing.textToImg : a.category === 'llm' ? a.pricing.inputPer1M : a.pricing.ttsPer1K;
        const pb = b.category === 'drawing' ? b.pricing.textToImg : b.category === 'llm' ? b.pricing.inputPer1M : b.pricing.ttsPer1K;
        return pb - pa;
      });
    } else if (sort === 'latency-asc') {
      list.sort((a, b) => parseFloat(a.latency.cn) - parseFloat(b.latency.cn));
    } else if (sort === 'rating-desc') {
      list.sort((a, b) => b.rating - a.rating);
    }

    // 渲染
    grid.innerHTML = list.length > 0
      ? list.map(p => renderProviderCard(p)).join('')
      : `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon">&#128269;</div><div class="empty-state-title">未找到匹配结果</div><div class="empty-state-desc">尝试调整筛选条件或搜索关键词</div></div>`;

    if (countEl) countEl.textContent = `共 ${list.length} 家服务商`;
  }

  if (searchInput) searchInput.addEventListener('input', apply);
  if (categoryFilter) categoryFilter.addEventListener('change', apply);
  if (statusFilter) statusFilter.addEventListener('change', apply);
  if (sortFilter) sortFilter.addEventListener('change', apply);

  apply();
}

// 渲染测评卡片
function renderReviewCard(r) {
  const typeBadge = {
    '横评': { cls: 'badge-trial', label: '横评' },
    '深度测评': { cls: 'badge-verified', label: '深度测评' },
    '避坑指南': { cls: 'badge-risk', label: '避坑' },
    '新手教程': { cls: 'badge-trial', label: '教程' },
    '教程': { cls: 'badge-trial', label: '教程' },
  }[r.type] || { cls: 'badge-category', label: r.type };

  const catLabel = { 'llm': '大模型', 'drawing': '绘图', 'speech': '语音' }[r.category] || r.category;

  return `
    <div class="review-card animate-fade-in">
      <div class="review-card-header">
        <span class="badge ${typeBadge.cls}">${typeBadge.label}</span>
        <span class="badge badge-category">${catLabel}</span>
      </div>
      <a href="#" class="review-card-title" style="text-decoration:none;" onclick="return false;">${r.title}</a>
      <div class="review-card-summary">${r.summary}</div>
      <div class="review-card-footer">
        <div>${r.date} · ${r.readTime} · ${r.author}</div>
        <div class="review-card-tags">${r.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
      </div>
    </div>
  `;
}

// 渲染测评列表
function initReviewList() {
  const grid = document.getElementById('reviewGrid');
  if (!grid) return;

  const categoryFilter = document.getElementById('reviewCategoryFilter');
  const typeFilter = document.getElementById('reviewTypeFilter');
  const tagFilter = document.getElementById('reviewTagFilter');

  function apply() {
    let list = [...reviews];
    if (categoryFilter && categoryFilter.value !== 'all') list = list.filter(r => r.category === categoryFilter.value);
    if (typeFilter && typeFilter.value !== 'all') list = list.filter(r => r.type === typeFilter.value);
    if (tagFilter && tagFilter.value !== 'all') list = list.filter(r => r.tags.includes(tagFilter.value));

    grid.innerHTML = list.length > 0
      ? list.map(r => renderReviewCard(r)).join('')
      : `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon">&#128269;</div><div class="empty-state-title">未找到匹配测评</div></div>`;
  }

  if (categoryFilter) categoryFilter.addEventListener('change', apply);
  if (typeFilter) typeFilter.addEventListener('change', apply);
  if (tagFilter) tagFilter.addEventListener('change', apply);

  apply();
}

// 分页辅助
function paginate(items, pageSize = 6) {
  const pages = [];
  for (let i = 0; i < items.length; i += pageSize) pages.push(items.slice(i, i + pageSize));
  return pages;
}

// 渲染分页
function renderPagination(totalPages, currentPage, onPageChange) {
  const container = document.getElementById('pagination');
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  container.innerHTML = html;
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => onPageChange(parseInt(btn.dataset.page)));
  });
}

// 解析 URL 参数
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  initNavHighlight();
});
