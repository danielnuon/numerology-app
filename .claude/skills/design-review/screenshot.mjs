#!/usr/bin/env node
// Full-page screenshots of Solini at several viewport widths, plus a horizontal-overflow check.
//
//   node .claude/skills/design-review/screenshot.mjs [url ...] [--widths=320,768,1280,1920] [--out=.claude/screenshots]
//
// With no URL, captures the empty form and the worked-example result on http://localhost:3000.
// Needs Playwright with Chromium. Locally, if it's missing: `npx playwright install chromium`
// and run with `npx -p playwright node .claude/skills/design-review/screenshot.mjs`.

import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright not found. Run: npx playwright install chromium, then npx -p playwright node " + process.argv[1]);
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const widths = flag("widths", "320,768,1280,1920").split(",").map(Number);
const outDir = flag("out", ".claude/screenshots");
const urls = args.filter((a) => !a.startsWith("--"));
if (urls.length === 0) {
  urls.push("http://localhost:3000/", "http://localhost:3000/?year=1997&month=7&day=24");
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
let overflowCount = 0;

for (const url of urls) {
  const slug = new URL(url).pathname.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home";
  const query = new URL(url).search ? "-result" : "";
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url, { waitUntil: "networkidle" });
    // Let entrance animations and auto-scroll settle.
    await page.waitForTimeout(1500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const file = path.join(outDir, `${slug}${query}-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const note = overflow > 0 ? `  OVERFLOW: page is ${overflow}px wider than the viewport` : "";
    if (overflow > 0) overflowCount++;
    console.log(`${file}${note}`);
    await page.close();
  }
}

await browser.close();
if (overflowCount > 0) process.exitCode = 2;
