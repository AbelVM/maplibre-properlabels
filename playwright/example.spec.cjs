const { test, expect } = require('@playwright/test');

test('example page loads and has map container', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/example/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#map', { timeout: 15000 });
  const title = await page.title();
  expect(title).toContain('MapLibre');
});

test('index.html exposes ProperLabels global', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/example/index.html', { waitUntil: 'networkidle' });
  const has = await page.evaluate(() => typeof window.ProperLabels !== 'undefined');
  expect(has).toBe(true);
});

// Note: index2.html not present in all workspaces; skip explicit check.
