#!/usr/bin/env node

/**
 * Agent Browser Screenshot Script
 *
 * Takes screenshots of the running dev app using Playwright.
 * Accepts a JSON config as the first argument or via stdin.
 *
 * Usage:
 *   node screenshot.js '<json_config>'
 *   echo '<json_config>' | node screenshot.js
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function main() {
  // Parse config from argument or stdin
  let configJson = process.argv[2];
  if (!configJson) {
    configJson = fs.readFileSync("/dev/stdin", "utf-8");
  }

  const config = JSON.parse(configJson);
  const baseUrl = config.baseUrl || "http://localhost:3000";
  const outputDir = config.outputDir || "tmp/screenshots";
  const viewport = config.viewport || { width: 1280, height: 800 };

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: viewport,
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // Login if credentials provided
  if (config.login) {
    const loginUrl = config.login.url || "/users/sign_in";
    const emailField = config.login.emailField || "user[email]";
    const passwordField = config.login.passwordField || "user[password]";

    console.log("Logging in...");
    await page.goto(`${baseUrl}${loginUrl}`);
    await page.waitForSelector(`input[name="${emailField}"]`, {
      timeout: 10000,
    });
    await page.fill(`input[name="${emailField}"]`, config.login.email);
    await page.fill(`input[name="${passwordField}"]`, config.login.password);
    await page.click('input[type="submit"], button[type="submit"]');
    await page.waitForURL((url) => !url.toString().includes("/sign_in"), {
      timeout: 10000,
    });
    console.log("Logged in successfully");
  }

  // Take screenshots
  const results = [];
  for (const shot of config.screenshots) {
    console.log(`Capturing: ${shot.name} (${shot.path})`);

    try {
      await page.goto(`${baseUrl}${shot.path}`, {
        waitUntil: "networkidle",
        timeout: 15000,
      });

      // Wait for specific element if requested
      if (shot.waitFor) {
        await page.waitForSelector(shot.waitFor, { timeout: 10000 });
      }

      // Perform actions if any
      if (shot.actions) {
        for (const action of shot.actions) {
          await performAction(page, action, baseUrl, outputDir);
        }
      }

      // Small delay for animations to settle
      await page.waitForTimeout(300);

      const fullPage = shot.fullPage !== undefined ? shot.fullPage : true;
      const filePath = path.join(outputDir, `${shot.name}.png`);

      await page.screenshot({ path: filePath, fullPage: fullPage });
      console.log(`  Saved: ${filePath}`);
      results.push({ name: shot.name, path: filePath, success: true });
    } catch (err) {
      console.error(`  Error capturing ${shot.name}: ${err.message}`);
      results.push({ name: shot.name, success: false, error: err.message });
    }
  }

  await browser.close();

  // Print summary
  console.log("\n--- Screenshot Summary ---");
  for (const r of results) {
    const status = r.success ? "OK" : "FAILED";
    console.log(`  [${status}] ${r.name}${r.path ? ` -> ${r.path}` : ""}`);
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    process.exit(1);
  }
}

async function performAction(page, action, baseUrl, outputDir) {
  if (action.click) {
    console.log(`    Action: click "${action.click}"`);
    await page.click(action.click);
    await page.waitForTimeout(200);
  } else if (action.fill) {
    const [selector, value] = action.fill;
    console.log(`    Action: fill "${selector}" with "${value}"`);
    await page.fill(selector, value);
    await page.waitForTimeout(100);
  } else if (action.wait) {
    console.log(`    Action: wait ${action.wait}ms`);
    await page.waitForTimeout(action.wait);
  } else if (action.select) {
    const [selector, value] = action.select;
    console.log(`    Action: select "${value}" in "${selector}"`);
    await page.selectOption(selector, value);
    await page.waitForTimeout(200);
  } else if (action.hover) {
    console.log(`    Action: hover "${action.hover}"`);
    await page.hover(action.hover);
    await page.waitForTimeout(200);
  } else if (action.screenshot) {
    const filePath = path.join(outputDir, `${action.screenshot}.png`);
    console.log(`    Action: intermediate screenshot -> ${filePath}`);
    await page.screenshot({ path: filePath, fullPage: true });
  } else if (action.waitForSelector) {
    console.log(`    Action: waitForSelector "${action.waitForSelector}"`);
    await page.waitForSelector(action.waitForSelector, { timeout: 10000 });
  } else if (action.type) {
    // type is like fill but with keystrokes (useful for searchable selects)
    const [selector, value] = action.type;
    console.log(`    Action: type "${value}" into "${selector}"`);
    await page.locator(selector).pressSequentially(value, { delay: 50 });
    await page.waitForTimeout(200);
  } else {
    console.log(`    Action: unknown action`, action);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
