const { chromium } = require("playwright");
const path = require("path");

const base = "http://127.0.0.1:8080";
const output = path.resolve(__dirname, "screenshots");

async function inspect(page, route, name) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("lucide")) errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
  const layout = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim(),
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    articleCards: document.querySelectorAll(".article-card").length,
    blankText: document.body.innerText.trim().length < 200
  }));
  if (layout.bodyWidth > layout.viewportWidth + 1) errors.push(`horizontal overflow ${layout.bodyWidth}/${layout.viewportWidth}`);
  if (!layout.h1) errors.push("missing h1");
  if (layout.blankText) errors.push("page appears blank");
  return { route, ...layout, errors };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  });
  const results = [];
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const desktopPage = await desktop.newPage();
  results.push(await inspect(desktopPage, "/index.html", "home-desktop"));
  results.push(await inspect(desktopPage, "/articles.html", "articles-desktop"));
  results.push(await inspect(desktopPage, "/article.html?slug=api-request-lifecycle", "article-desktop"));
  await desktopPage.goto(`${base}/articles.html`, { waitUntil: "domcontentloaded" });
  await desktopPage.click('[data-category="practice"]');
  const filtered = await desktopPage.locator(".article-card").count();
  if (filtered < 1) throw new Error("Article category filter returned no results");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  results.push(await inspect(mobilePage, "/index.html", "home-mobile"));
  await mobilePage.click("[data-menu-button]");
  if (!(await mobilePage.locator("[data-main-nav]").evaluate((node) => node.classList.contains("open")))) throw new Error("Mobile menu did not open");
  results.push(await inspect(mobilePage, "/article.html?slug=api-request-lifecycle", "article-mobile"));
  await mobile.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  if (results.some((result) => result.errors.length)) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
