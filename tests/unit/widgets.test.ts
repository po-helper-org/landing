import { describe, expect, it } from 'vitest';
import { widget } from '../../src/lib/schemas';
import { readDocs } from './helpers';

const widgets = readDocs('src/content/widgets');
const nodes = new Set(readDocs('src/content/method').map((n) => n.slug));

describe('виджеты', () => {
  it('набор не пустой, закрытые описаны', () => {
    expect(widgets.length).toBeGreaterThanOrEqual(10);
    expect(widgets.some((w) => w.data.status === 'закрытый')).toBe(true);
  });

  it('каждый виджет проходит схему', () => {
    for (const w of widgets) {
      const r = widget.safeParse(w.data);
      expect(r.success, `${w.slug}: ${r.success ? '' : r.error.message}`).toBe(true);
    }
  });

  it('каждый виджет привязан к существующим узлам методологии', () => {
    for (const w of widgets) for (const n of w.data.nodes as string[]) expect(nodes.has(n), `${w.slug}: узел ${n}`).toBe(true);
  });

  it('у закрытого виджета нет ссылки на репозиторий, ни в данных, ни в тексте', () => {
    for (const w of widgets.filter((x) => x.data.status === 'закрытый')) {
      expect(w.data.repo, w.slug).toBeUndefined();
      expect(JSON.stringify(w.data) + w.body, w.slug).not.toMatch(/github\.com|git\.|https?:\/\//);
    }
  });

  it('публичные ссылки ведут только в организацию po-helper-org', () => {
    for (const w of widgets.filter((x) => x.data.repo)) expect(String(w.data.repo), w.slug).toMatch(/^https:\/\/github\.com\/po-helper-org\/[\w.-]+$/);
  });

  it('схема отвергает закрытый виджет со ссылкой или без заметки', () => {
    const base = { title: 'Тест виджета', task: 'Задача виджета для проверки схемы.', audience: 'PO и команды', status: 'закрытый', type: 'навык', nodes: ['reshenie'] };
    expect(widget.safeParse({ ...base, note: 'Описание.', repo: 'https://github.com/po-helper-org/x' }).success).toBe(false);
    expect(widget.safeParse({ ...base }).success).toBe(false);
    expect(widget.safeParse({ ...base, note: 'Описание.' }).success).toBe(true);
  });

  it('схема отвергает виджет без обязательного поля', () => {
    expect(widget.safeParse({ title: 'Тест виджета', status: 'работает', type: 'навык', nodes: ['reshenie'] }).success).toBe(false);
  });
});
