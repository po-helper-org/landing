import { expect, test } from '@playwright/test';

const PAGES = ['/po-system/', '/po-system/method/', '/po-system/method/postavka/', '/po-system/widgets/', '/po-system/widgets/bft-writer/'];

test.describe('первый экран', () => {
  test('кнопка «Обсудить внедрение» ведёт в Telegram', async ({ page }) => {
    await page.goto('/po-system/');
    const cta = page.getByRole('link', { name: 'Обсудить внедрение' }).first();
    await expect(cta).toHaveAttribute('href', 'https://t.me/kibarik');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('IT-департамент');
  });

  test('страница не обращается к сторонним доменам', async ({ page, baseURL }) => {
    const hosts = new Set<string>();
    page.on('request', (r) => hosts.add(new URL(r.url()).host));
    await page.goto('/po-system/');
    await page.waitForLoadState('networkidle');
    expect([...hosts]).toEqual([new URL(baseURL!).host]);
  });

  test('при «уменьшить движение» анимаций нет и всё видно сразу', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', baseURL });
    const page = await ctx.newPage();
    await page.goto('/po-system/');
    const hidden = await page.$$eval('[data-reveal]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
    expect(hidden).toBe(0);
    const anim = await page.$eval('.dot', (e) => getComputedStyle(e).animationName);
    expect(anim).toBe('none');
    await ctx.close();
  });

  test('есть заголовок страницы, описание и подвал с контактами', async ({ page }) => {
    await page.goto('/po-system/');
    await expect(page).toHaveTitle(/po-helper-org/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
    await expect(page.locator('footer')).toContainText('Telegram');
  });
});

test.describe('главная целиком', () => {
  test('шесть секций в заданном порядке', async ({ page }) => {
    await page.goto('/po-system/');
    const ids = await page.$$eval('main > section', (els) => els.map((e) => e.id || e.className.split(' ')[0]));
    expect(ids).toEqual(['hero', 'process', 'widgets', 'closed', 'connect']);
    await expect(page.locator('footer')).toBeVisible();
  });

  test('процесс ведёт на стадии, витрина группирует виджеты, закрытый контур без ссылок на репозитории', async ({ page }) => {
    await page.goto('/po-system/');
    await expect(page.locator('#process .m-flow li')).toHaveCount(5);
    expect(await page.locator('#widgets .showcase__group').count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator('#closed .wcard')).toHaveCount(2);
    expect(await page.locator('#closed a[href*="github.com"]').count()).toBe(0);
    await page.locator('#process .m-flow a').first().click();
    await expect(page).toHaveURL(/\/po-system\/method\/vhod-zaprosov\/$/);
  });

  test('«Как подключить» заканчивается кнопкой в Telegram', async ({ page }) => {
    await page.goto('/po-system/');
    await expect(page.locator('#connect .step')).toHaveCount(3);
    await expect(page.locator('#connect').getByRole('link', { name: 'Обсудить внедрение' })).toHaveAttribute('href', 'https://t.me/kibarik');
  });
});

test.describe('методология', () => {
  test('карта показывает пять стадий и ведёт на страницу стадии', async ({ page }) => {
    await page.goto('/po-system/method/');
    await expect(page.locator('.m-flow li')).toHaveCount(5);
    await page.locator('.m-flow a').nth(3).click();
    await expect(page).toHaveURL(/\/po-system\/method\/postavka\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Поставка');
  });

  test('страница стадии: диаграмма, гейт, материалы основного сайта, виджеты', async ({ page }) => {
    await page.goto('/po-system/method/postavka/');
    await expect(page.locator('.flow')).toBeVisible();
    await expect(page.locator('.gate-box')).toContainText('Гейт');
    const mat = page.locator('.materials a[href^="https://aleksishmanov.ru/"]').first();
    await expect(mat).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Что автоматизирует эту часть' })).toBeVisible();
  });
});

test.describe('виджеты', () => {
  test('витрина группирует виджеты по стадиям и показывает статусы', async ({ page }) => {
    await page.goto('/po-system/widgets/');
    await expect(page.locator('.wgroup').first()).toBeVisible();
    await expect(page.locator('.chip').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Закрытый контур' })).toBeVisible();
  });

  test('публичный виджет ведёт в репозиторий организации', async ({ page }) => {
    await page.goto('/po-system/widgets/bft-writer/');
    await expect(page.getByRole('link', { name: 'Репозиторий на GitHub' })).toHaveAttribute('href', 'https://github.com/po-helper-org/poh-bft-writer');
  });

  test('в HTML закрытого виджета нет ссылок на репозитории', async ({ request }) => {
    for (const slug of ['private-inbox', 'private-workspace']) {
      const html = await (await request.get(`/po-system/widgets/${slug}/`)).text();
      expect(html).not.toMatch(/github\.com\/po-helper-org\/(?!\.github)/);
      expect(html).not.toContain('Репозиторий на GitHub');
      expect(html).toContain('Репозиторий закрыт');
    }
  });
});

test.describe('все страницы', () => {
  for (const url of PAGES) {
    test(`${url}: открывается, все внутренние ссылки под префиксом, нет горизонтальной прокрутки`, async ({ page }) => {
      const res = await page.goto(url);
      expect(res?.status()).toBe(200);
      const links = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')!));
      for (const l of links) expect(l.startsWith('/po-system/'), l).toBe(true);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow).toBe(false);
    });
  }

  test('внутренние ссылки главной не ведут на 404', async ({ page, request }) => {
    await page.goto('/po-system/');
    const links = new Set(await page.$$eval('a[href^="/po-system/"]', (as) => as.map((a) => a.getAttribute('href')!)));
    for (const l of links) expect((await request.get(l)).status(), l).toBe(200);
  });
});
