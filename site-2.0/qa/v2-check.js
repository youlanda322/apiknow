const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const base = "http://127.0.0.1:8081";
const screenshots = path.resolve(__dirname, "v2-screenshots");
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
fs.mkdirSync(screenshots, { recursive: true });

async function inspect(page, route, name) {
  const errors = [];
  const listener = (message) => { if (message.type() === "error") errors.push(message.text()); };
  page.on("console", listener);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(250);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim(),
    width: document.body.scrollWidth,
    viewport: window.innerWidth,
    textLength: document.body.innerText.trim().length,
    stations: document.querySelectorAll(".station-card").length,
    stories: document.querySelectorAll(".story-card").length
  }));
  if (!result.h1) errors.push("missing h1");
  if (result.width > result.viewport + 1) errors.push(`overflow ${result.width}/${result.viewport}`);
  if (result.textLength < 200) errors.push("page appears blank");
  await page.screenshot({ path: path.join(screenshots, `${name}.png`), fullPage: true });
  page.off("console", listener);
  return { route, ...result, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edge });
  const results = [];
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  results.push(await inspect(page, "/index.html", "home-desktop"));
  results.push(await inspect(page, "/stations.html", "stations-desktop"));
  results.push(await inspect(page, "/methodology.html", "methodology-desktop"));
  results.push(await inspect(page, "/articles.html", "articles-desktop"));
  results.push(await inspect(page, "/editor.html", "editor-desktop"));

  await page.goto(`${base}/stations.html`, { waitUntil: "domcontentloaded" });
  await page.fill("[data-station-search]", "绘图");
  if (await page.locator(".station-card").count() < 1) throw new Error("station search failed");
  await page.goto(`${base}/articles.html`, { waitUntil: "domcontentloaded" });
  const firstTag = page.locator("[data-tag]").nth(1);
  if (await firstTag.count()) await firstTag.click();
  if (await page.locator(".story-card").count() < 1) throw new Error("article tag filter failed");
  await page.goto(`${base}/editor.html`, { waitUntil: "domcontentloaded" });
  await page.fill('[name="title"]', "测试文章标题");
  await page.fill("[data-tag-input]", "中转站测评");
  await page.press("[data-tag-input]", "Enter");
  const output = await page.inputValue("[data-editor-output]");
  if (!output.includes("中转站测评") || !output.includes("测试文章标题")) throw new Error("editor tag export failed");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  results.push(await inspect(mobilePage, "/index.html", "home-mobile"));
  await mobilePage.click("[data-menu]");
  if (!(await mobilePage.locator("[data-nav]").evaluate((node) => node.classList.contains("is-open")))) throw new Error("mobile menu failed");
  results.push(await inspect(mobilePage, "/station.html?id=sample-alpha", "station-mobile"));
  results.push(await inspect(mobilePage, "/editor.html", "editor-mobile"));
  await mobile.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  if (results.some((result) => result.errors.length)) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
