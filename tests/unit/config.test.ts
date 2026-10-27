import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('конфигурация подсайта', () => {
  const config = readFileSync('astro.config.mjs', 'utf8');
  const nginx = readFileSync('nginx.conf', 'utf8');

  it('собирается с префиксом /po-system', () => {
    expect(config).toMatch(/base:\s*'\/po-system'/);
  });

  it('nginx отдаёт подсайт только под префиксом и не отвечает за корень', () => {
    expect(nginx).toMatch(/location \^~ \/po-system\//);
    expect(nginx).toMatch(/location \/ \{ return 404; \}/);
  });

  it('не создаёт корневые robots.txt и sitemap-index.xml (их ведёт основной сайт)', () => {
    expect(() => readFileSync('public/robots.txt')).toThrow();
    expect(() => readFileSync('public/sitemap-index.xml')).toThrow();
  });
});
