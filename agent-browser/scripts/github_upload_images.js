#!/usr/bin/env node

const { chromium } = require("playwright");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function main() {
  const config = JSON.parse(process.argv[2]);
  const prUrl = config.pr_url;
  const images = config.images;

  const token = execSync("gh auth token", { encoding: "utf-8" }).trim();
  const username = execSync("gh api user --jq '.login'", { encoding: "utf-8" }).trim();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // Login
  console.log("Authenticating with GitHub...");
  await page.goto("https://github.com/login", { waitUntil: "domcontentloaded" });
  await page.fill("#login_field", username);
  await page.fill("#password", token);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(5000);

  const afterLoginUrl = page.url();
  if (afterLoginUrl.includes("/login") || afterLoginUrl.includes("two-factor")) {
    console.error(`Login failed. URL: ${afterLoginUrl}`);
    await page.screenshot({ path: "tmp/screenshots/debug-login.png" });
    await browser.close();
    process.exit(1);
  }
  console.log("Logged in");

  // Navigate to the PR
  console.log(`Opening ${prUrl}...`);
  await page.goto(prUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);

  // Debug
  await page.screenshot({ path: "tmp/screenshots/debug-pr-page.png", fullPage: false });

  // Scroll to bottom to find comment box
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/screenshots/debug-pr-bottom.png", fullPage: false });

  const textareas = await page.$$eval("textarea", (els) =>
    els.map((el) => ({ id: el.id, name: el.name, className: el.className.substring(0, 100) }))
  );
  console.log("Textareas:", JSON.stringify(textareas));

  const fileInputs = await page.$$eval('input[type="file"]', (els) =>
    els.map((el) => ({ id: el.id, name: el.name, className: el.className.substring(0, 100), accept: el.accept }))
  );
  console.log("File inputs:", JSON.stringify(fileInputs));

  const uploadedImages = [];

  for (const img of images) {
    const absPath = path.resolve(img.path);
    if (!fs.existsSync(absPath)) {
      uploadedImages.push({ ...img, url: null });
      continue;
    }
    console.log(`Uploading: ${img.path}`);

    // Find textarea
    let textarea = await page.$("textarea#new_comment_field");
    if (!textarea) textarea = await page.$('textarea[name="comment[body]"]');
    if (!textarea) textarea = await page.$("textarea.js-comment-field");
    if (!textarea) {
      const allTextareas = await page.$$("textarea");
      if (allTextareas.length > 0) textarea = allTextareas[allTextareas.length - 1];
    }

    if (!textarea) {
      console.error("  No textarea found");
      uploadedImages.push({ ...img, url: null });
      continue;
    }
    console.log("  Found textarea");

    await textarea.click();
    await textarea.fill("");
    await page.waitForTimeout(500);

    // Find file input
    let fileInput = null;
    const allInputs = await page.$$('input[type="file"]');
    for (const input of allInputs) {
      const accept = await input.getAttribute("accept");
      if (accept && accept.includes("image")) {
        fileInput = input;
        break;
      }
    }
    if (!fileInput && allInputs.length > 0) fileInput = allInputs[allInputs.length - 1];

    if (!fileInput) {
      console.error("  No file input found");
      uploadedImages.push({ ...img, url: null });
      continue;
    }
    console.log("  Found file input");

    await fileInput.setInputFiles(absPath);

    // Wait for upload
    let url = null;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(500);
      const content = await textarea.inputValue();
      // Match ![Uploading ...]() -> ![alt](https://...)
      const match = content.match(/!\[.*?\]\((https:\/\/[^\)]+)\)/);
      if (match) {
        url = match[1];
        break;
      }
    }

    if (url) {
      console.log(`  URL: ${url}`);
      uploadedImages.push({ ...img, url });
    } else {
      const content = await textarea.inputValue();
      console.error(`  Failed. Content: "${content.substring(0, 300)}"`);
      uploadedImages.push({ ...img, url: null });
    }

    await textarea.fill("");
  }

  await browser.close();

  // Print results as JSON for parsing
  console.log("RESULTS:" + JSON.stringify(uploadedImages));
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
