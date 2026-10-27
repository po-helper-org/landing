import { expect, test } from '@playwright/test';

test.describe('поисковые файлы подсайта', () => {
  test('sitemap-po-system.xml перечисляет страницы под префиксом', async ({ request }) => {
    const res = await request.get('/po-system/sitemap-po-system.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<loc>https://aleksishmanov.ru/po-system/</loc>');
    expect(xml).toContain('<loc>https://aleksishmanov.ru/po-system/method/postavka/</loc>');
    expect(xml).toContain('<loc>https://aleksishmanov.ru/po-system/widgets/bft-writer/</loc>');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) expect(m[1].startsWith('https://aleksishmanov.ru/po-system/'), m[1]).toBe(true);
  });

  test('llms-po-system.txt описывает страницы', async ({ request }) => {
    const res = await request.get('/po-system/llms-po-system.txt');
    expect(res.status()).toBe(200);
    const txt = await res.text();
    expect(txt).toMatch(/^# po-helper-org/);
    expect(txt).toContain('## Методология');
    expect(txt).toContain('## Виджеты');
    expect(txt).toContain('https://aleksishmanov.ru/po-system/widgets/');
  });

  test('подсайт не создаёт корневые robots.txt и sitemap-index.xml', async ({ request }) => {
    for (const p of ['/po-system/robots.txt', '/po-system/sitemap-index.xml', '/robots.txt']) expect((await request.get(p)).status(), p).toBe(404);
  });

  test('на каждой странице canonical указывает на aleksishmanov.ru', async ({ page }) => {
    for (const [path, canon] of [
      ['/po-system/', 'https://aleksishmanov.ru/po-system/'],
      ['/po-system/method/postavka/', 'https://aleksishmanov.ru/po-system/method/postavka/'],
      ['/po-system/widgets/', 'https://aleksishmanov.ru/po-system/widgets/'],
    ]) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canon);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    }
  });

  test('счётчик не подключён, пока не задан PUBLIC_METRIKA_ID', async ({ page }) => {
    await page.goto('/po-system/');
    expect(await page.content()).not.toContain('mc.yandex.ru');
  });

  test('текст главной полностью в HTML без выполнения JS', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    await page.goto('/po-system/');
    await expect(page.getByRole('heading', { name: 'Пять стадий от запроса до результата' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Три шага до первого виджета' })).toBeVisible();
    await ctx.close();
  });
});
