import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('конфигурация подсайта', () => {
  const config = readFileSync('astro.config.mjs', 'utf8');
  const nginx = readFileSync('nginx.conf', 'utf8');

  it('собирается для своего поддомена без префикса', () => {
    expect(config).toMatch(/site:\s*'https:\/\/po-system\.aleksishmanov\.ru'/);
    expect(config).not.toMatch(/base:/);
  });

  it('nginx отдаёт подсайт из корня с настоящим 404', () => {
    expect(nginx).toMatch(/error_page 404 \/404\.html/);
    expect(nginx).toMatch(/location \^~ \/_astro\//);
  });

  it('robots.txt лежит в public и указывает на sitemap.xml', () => {
    expect(readFileSync('public/robots.txt', 'utf8')).toContain('Sitemap: https://po-system.aleksishmanov.ru/sitemap.xml');
  });
});
