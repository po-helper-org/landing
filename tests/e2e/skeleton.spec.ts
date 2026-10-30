import { expect, test } from '@playwright/test';

test('главная подсайта открывается в корне', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://po-system.aleksishmanov.ru/');
});

test('адрес без слэша переходит на адрес со слэшем', async ({ request }) => {
  const res = await request.get('/method', { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers()['location']).toMatch(/\/method\/$/);
});

test('ресурсы страницы грузятся без ошибок', async ({ page }) => {
  const bad: string[] = [];
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(bad).toEqual([]);
  const hrefs = await page.$$eval('[href], [src]', (els) => els.map((e) => e.getAttribute('href') ?? e.getAttribute('src') ?? ''));
  for (const h of hrefs.filter((h) => h.startsWith('/'))) expect(h.startsWith('/')).toBe(true);
});

test('неизвестный адрес даёт настоящий 404 со страницей подсайта', async ({ request }) => {
  const res = await request.get('/net-takoj-stranicy/');
  expect(res.status()).toBe(404);
  expect(await res.text()).toContain('Страницы нет');
});

test('файлы с хешем кэшируются надолго, HTML — нет', async ({ request, page }) => {
  await page.goto('/');
  const css = await page.$$eval('link[rel="stylesheet"]', (els) => els.map((e) => e.getAttribute('href')));
  const asset = css.find((h) => h?.includes('/_astro/'));
  if (asset) {
    const r = await request.get(asset);
    expect(r.headers()['cache-control']).toContain('immutable');
  }
  const html = await request.get('/');
  expect(html.headers()['cache-control']).toContain('no-cache');
});

test('на мобильной ширине нет горизонтальной прокрутки', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
