import { describe, expect, it } from 'vitest';
import { metrikaSnippet } from '../../src/lib/metrika';

describe('счётчик Метрики', () => {
  it('без идентификатора кода нет', () => {
    expect(metrikaSnippet(undefined)).toBe('');
    expect(metrikaSnippet('')).toBe('');
  });

  it('с идентификатором: один init, загрузка асинхронная, вебвизор не включён', () => {
    const code = metrikaSnippet('12345678');
    expect(code.match(/ym\(12345678,"init"/g)).toHaveLength(1);
    expect(code).toContain('k.async=1');
    expect(code).not.toMatch(/webvisor:\s*true/);
  });

  it('некорректный идентификатор ломает сборку', () => {
    expect(() => metrikaSnippet('abc')).toThrow(/PUBLIC_METRIKA_ID/);
  });
});
