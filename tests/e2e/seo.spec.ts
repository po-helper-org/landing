import { expect, test } from '@playwright/test';

test.describe('поисковые файлы подсайта', () => {
  test('sitemap.xml перечисляет страницы подсайта', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<loc>https://po-system.aleksishmanov.ru/</loc>');
    expect(xml).toContain('<loc>https://po-system.aleksishmanov.ru/method/postavka/</loc>');
    expect(xml).toContain('<loc>https://po-system.aleksishmanov.ru/widgets/bft-writer/</loc>');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) expect(m[1].startsWith('https://po-system.aleksishmanov.ru/'), m[1]).toBe(true);
  });

  test('llms.txt описывает страницы', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    const txt = await res.text();
    expect(txt).toMatch(/^# po-helper-org/);
    expect(txt).toContain('## Методология');
    expect(txt).toContain('## Виджеты');
    expect(txt).toContain('https://po-system.aleksishmanov.ru/widgets/');
  });

  test('robots.txt разрешает обход и указывает на sitemap.xml', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const txt = await res.text();
    expect(txt).toContain('Allow: /');
    expect(txt).toContain('Sitemap: https://po-system.aleksishmanov.ru/sitemap.xml');
    expect((await request.get('/sitemap-index.xml')).status()).toBe(404);
  });

  test('на каждой странице canonical указывает на po-system.aleksishmanov.ru', async ({ page }) => {
    for (const [path, canon] of [
      ['/', 'https://po-system.aleksishmanov.ru/'],
      ['/method/postavka/', 'https://po-system.aleksishmanov.ru/method/postavka/'],
      ['/widgets/', 'https://po-system.aleksishmanov.ru/widgets/'],
    ]) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canon);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    }
  });

  test('счётчик не подключён, пока не задан PUBLIC_METRIKA_ID', async ({ page }) => {
    await page.goto('/');
    expect(await page.content()).not.toContain('mc.yandex.ru');
  });

  test('текст главной полностью в HTML без выполнения JS', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Пять стадий от запроса до результата' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Три шага до первого виджета' })).toBeVisible();
    await ctx.close();
  });
});
