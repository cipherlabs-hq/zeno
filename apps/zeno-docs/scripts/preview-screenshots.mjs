// Screenshots of a locally served build of this site, for review before a
// release. Also checks each page for console errors, sideways scrolling and
// axe-core violations, and writes what it found to report.json.
//
//   pnpm docs:build
//   pnpm --filter @usezeno/docs exec docusaurus serve --port 4321 --no-open
//   node apps/zeno-docs/scripts/preview-screenshots.mjs http://localhost:4321 <out-dir>
//
// The local server does not send the headers in build/_headers, so this script
// adds them to every page it loads. A script or style the content security
// policy would block on the real site then shows up here as a console error.
//
// Playwright and axe-core come from the dev dependencies of @usezeno/core.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHeaders } from './check-headers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const core = resolve(here, '../../../packages/core/package.json');
const require = createRequire(core);
const { chromium } = require('playwright');
const axeSource = await readFile(
  require.resolve('axe-core/axe.min.js'),
  'utf8'
);

const [base = 'http://localhost:4321', out = 'preview'] = process.argv.slice(2);

// The headers the real site sends. Two are left out because the preview is on
// plain http: the one that turns every request into https, and the one that
// tells the browser to come back over https only.
const siteHeaders = Object.fromEntries(
  parseHeaders(await readFile(resolve(here, '../build/_headers'), 'utf8'))
);
delete siteHeaders['strict-transport-security'];
siteHeaders['content-security-policy'] = siteHeaders['content-security-policy']
  .split(';')
  .filter(part => part.trim() !== 'upgrade-insecure-requests')
  .join(';');

const PAGES = [
  ['home', '/'],
  ['get-started', '/get-started'],
  ['elements', '/elements'],
  ['element-button', '/elements/button'],
  ['element-input', '/elements/input'],
  ['element-select', '/elements/select'],
  ['tokens', '/tokens'],
  ['releases', '/releases'],
];

// More pages get the checks but no screenshot.
const CHECK_ONLY = [
  ['frameworks', '/frameworks'],
  ['versioning', '/versioning'],
  ['accessibility', '/accessibility'],
  ['contributing', '/contributing'],
  ['using-the-elements', '/using-the-elements'],
  ['building', '/building'],
  ['element-modal', '/elements/modal'],
  ['element-data-table', '/elements/data-table'],
  ['element-date-picker', '/elements/date-picker'],
  ['element-theme-toggle', '/elements/theme-toggle'],
];

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }],
  ['phone', { width: 390, height: 844 }],
];
const THEMES = ['light', 'dark'];

// Chromium cannot draw a taller picture than this at twice the density.
const MAX_HEIGHT = 8000;

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = [];
const shots = [];

for (const [viewportName, viewport] of VIEWPORTS) {
  for (const theme of THEMES) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 2,
      colorScheme: theme,
      reducedMotion: 'reduce',
    });
    await context.addInitScript(value => {
      try {
        localStorage.setItem('theme', value);
      } catch {
        // Storage can be off. The colour scheme above still applies.
      }
    }, theme);

    await context.route('**/*', async route => {
      if (route.request().resourceType() !== 'document') {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), ...siteHeaders },
      });
    });

    for (const [name, path, shoot] of [
      ...PAGES.map(page => [...page, true]),
      ...CHECK_ONLY.map(page => [...page, false]),
    ]) {
      const page = await context.newPage();
      const problems = [];
      page.on('console', message => {
        if (message.type() === 'error') problems.push(message.text());
      });
      page.on('pageerror', error => problems.push(String(error)));
      page.on('requestfailed', request =>
        problems.push(`request failed: ${request.url()}`)
      );
      page.on('response', response => {
        if (response.status() >= 400) {
          problems.push(`${response.status()}: ${response.url()}`);
        }
      });

      await page.goto(base + path, { waitUntil: 'networkidle' });
      // Every Zeno element on the page is registered and has drawn.
      await page.waitForFunction(
        () => document.querySelectorAll(':not(:defined)').length === 0
      );
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      const size = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        width: window.innerWidth,
        height: document.documentElement.scrollHeight,
        theme: document.documentElement.dataset.theme,
      }));

      // Evaluated, not added as a script tag, which the policy would block.
      await page.evaluate(axeSource);
      const axe = await page.evaluate(async () => {
        const result = await window.axe.run(document, {
          runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        });
        return result.violations.map(violation => ({
          id: violation.id,
          impact: violation.impact,
          count: violation.nodes.length,
          first: violation.nodes[0].target.join(' '),
          summary: violation.nodes[0].failureSummary,
        }));
      });

      report.push({
        page: path,
        viewport: viewportName,
        theme,
        appliedTheme: size.theme,
        sideways: size.scrollWidth > size.width,
        scrollWidth: size.scrollWidth,
        height: size.height,
        problems,
        axe,
      });

      if (shoot) {
        const file = `${name}--${viewportName}-${theme}.png`;
        await page.screenshot({
          path: join(out, file),
          fullPage: true,
          clip:
            size.height > MAX_HEIGHT
              ? { x: 0, y: 0, width: viewport.width, height: MAX_HEIGHT }
              : undefined,
        });
        const top = `top/${name}--${viewportName}-${theme}.png`;
        await mkdir(join(out, 'top'), { recursive: true });
        await page.screenshot({ path: join(out, top) });
        shots.push({ name, viewportName, theme, file, top });
      }
      await page.close();
    }
    await context.close();
  }
}

await writeFile(
  join(out, 'report.json'),
  `${JSON.stringify(report, null, 2)}\n`
);

// The contact sheet: the top of every page, one row per page.
const cell = shot =>
  `<figure><img src="${shot.top}" style="width:${
    shot.viewportName === 'desktop' ? 480 : 150
  }px"><figcaption>${shot.viewportName}, ${shot.theme}</figcaption></figure>`;
const rows = PAGES.map(
  ([name, path]) =>
    `<section><h2>${path}</h2><div>${shots
      .filter(shot => shot.name === name)
      .map(cell)
      .join('')}</div></section>`
).join('');
const sheet = `<!doctype html><meta charset="utf-8"><title>Zeno site preview</title>
<style>
  body { margin: 24px; font: 14px/1.4 system-ui, sans-serif; background: #e9e9e9; color: #161616; }
  h1 { font-size: 20px; margin: 0 0 16px; }
  h2 { font-size: 14px; margin: 20px 0 8px; font-family: ui-monospace, monospace; }
  section > div { display: flex; gap: 12px; align-items: flex-start; }
  figure { margin: 0; }
  img { display: block; border: 1px solid #8d8d8d; }
  figcaption { font-size: 12px; margin-top: 4px; }
</style>
<h1>Zeno site preview: the top of each page, desktop (1440) and phone (390), light and dark</h1>
${rows}`;
await writeFile(join(out, 'contact-sheet.html'), sheet);
const sheetPage = await browser.newPage({
  viewport: { width: 1380, height: 900 },
  deviceScaleFactor: 1,
});
await sheetPage.goto(`file://${resolve(out, 'contact-sheet.html')}`);
await sheetPage.screenshot({
  path: join(out, 'contact-sheet.png'),
  fullPage: true,
});
await browser.close();

const bad = report.filter(
  entry => entry.sideways || entry.problems.length > 0 || entry.axe.length > 0
);
console.log(
  `${report.length} page views checked with the headers in build/_headers, ${shots.length} screenshots, ${bad.length} with something to look at.`
);
for (const entry of bad) {
  console.log(`\n${entry.page} (${entry.viewport}, ${entry.theme})`);
  if (entry.sideways) console.log(`  scrolls sideways: ${entry.scrollWidth}px`);
  for (const problem of entry.problems) console.log(`  ${problem}`);
  for (const violation of entry.axe) {
    console.log(
      `  axe ${violation.id} (${violation.impact}) x${violation.count}: ${violation.first}`
    );
  }
}
