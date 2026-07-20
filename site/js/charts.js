/* ========================================================
   APIKnow - 图表配置 (charts.js)
   ======================================================== */

const chartColors = {
  primary: '#c9a84c',
  primaryLight: 'rgba(201,168,76,0.15)',
  secondary: '#4a7c9b',
  secondaryLight: 'rgba(74,124,155,0.15)',
  green: '#4a7c59',
  greenLight: 'rgba(74,124,89,0.15)',
  red: '#a94442',
  redLight: 'rgba(169,68,66,0.15)',
  orange: '#c9892e',
  orangeLight: 'rgba(201,137,46,0.15)',
  text: '#6b6560',
  grid: '#eae6df',
};

const chartFont = { family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" };

function commonOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: chartFont, color: chartColors.text } },
      title: { display: !!title, text: title, font: { ...chartFont, size: 16, weight: '700' }, color: '#1a1f2e', padding: { bottom: 16 } },
      tooltip: {
        backgroundColor: '#1a2533',
        titleFont: chartFont, bodyFont: chartFont,
        padding: 12, cornerRadius: 6,
      },
    },
    scales: {
      x: { grid: { color: chartColors.grid, drawBorder: false }, ticks: { font: chartFont, color: chartColors.text } },
      y: { grid: { color: chartColors.grid, drawBorder: false }, ticks: { font: chartFont, color: chartColors.text } },
    },
  };
}

function renderPriceBarChart(canvasId, data) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: '价格（USD / 1M tokens 或 张）',
        data: data.map(d => d.price),
        backgroundColor: data.map((_, i) => [chartColors.primary, chartColors.secondary, chartColors.green, chartColors.orange, chartColors.red][i % 5] + 'cc'),
        borderColor: data.map((_, i) => [chartColors.primary, chartColors.secondary, chartColors.green, chartColors.orange, chartColors.red][i % 5]),
        borderWidth: 1, borderRadius: 4, barPercentage: 0.6,
      }],
    },
    options: { ...commonOptions(), indexAxis: 'y', plugins: { ...commonOptions().plugins, legend: { display: false } } },
  });
}

function renderLatencyChart(canvasId, data) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: '国内延迟 (ms)',
        data: data.map(d => d.latency),
        backgroundColor: chartColors.secondary + 'cc',
        borderColor: chartColors.secondary,
        borderWidth: 1, borderRadius: 4, barPercentage: 0.6,
      }],
    },
    options: { ...commonOptions(), plugins: { ...commonOptions().plugins, legend: { display: false } } },
  });
}

function renderComparisonChart(canvasId, providers, metric) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const names = providers.map(p => p.name);
  const values = providers.map(p => {
    if (metric === 'inputPrice') return p.pricing.inputPer1M || 0;
    if (metric === 'outputPrice') return p.pricing.outputPer1M || 0;
    if (metric === 'textToImg') return p.pricing.textToImg || 0;
    if (metric === 'latency') return parseFloat(p.latency.cn) || 0;
    return 0;
  });
  const color = metric === 'latency' ? chartColors.orange : chartColors.primary;
  new Chart(ctx, {
    type: 'bar',
    data: { labels: names, datasets: [{
      label: metric === 'latency' ? '延迟 (ms)' : '价格',
      data: values, backgroundColor: color + 'cc', borderColor: color, borderWidth: 1, borderRadius: 4, barPercentage: 0.6,
    }] },
    options: { ...commonOptions(), plugins: { ...commonOptions().plugins, legend: { display: false } } },
  });
}

function renderCalcComparisonChart(canvasId, data, title) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: '预估费用',
        data: data.map(d => d.total),
        backgroundColor: data.map((_, i) => [chartColors.primary, chartColors.secondary, chartColors.green, chartColors.orange, chartColors.red][i % 5] + 'cc'),
        borderColor: data.map((_, i) => [chartColors.primary, chartColors.secondary, chartColors.green, chartColors.orange, chartColors.red][i % 5]),
        borderWidth: 1, borderRadius: 4, barPercentage: 0.6,
      }],
    },
    options: { ...commonOptions(title), plugins: { ...commonOptions(title).plugins, legend: { display: false } } },
  });
}
