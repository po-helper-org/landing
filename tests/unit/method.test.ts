import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { methodNode } from '../../src/lib/schemas';
import { materials, readDocs } from './helpers';

const nodes = readDocs('src/content/method');
const slugs = new Set(nodes.map((n) => n.slug));
const redirects: Record<string, string> = JSON.parse(fs.readFileSync('src/data/method-redirects.json', 'utf8'));

describe('узлы методологии', () => {
  it('перенесены готовые узлы', () => {
    expect(nodes.length).toBeGreaterThanOrEqual(9);
    for (const n of nodes) expect(n.data.status, n.slug).toBe('ready');
  });

  it('каждый узел проходит схему', () => {
    for (const n of nodes) {
      const r = methodNode.safeParse(n.data);
      expect(r.success, `${n.slug}: ${r.success ? '' : r.error.message}`).toBe(true);
    }
  });

  it('один корень, каждый родитель существует', () => {
    expect(nodes.filter((n) => n.data.level === 'problem')).toHaveLength(1);
    for (const n of nodes) if (n.data.level !== 'problem') expect(slugs.has(String(n.data.parent)), `${n.slug}: родитель ${n.data.parent}`).toBe(true);
  });

  it('пять стадий пронумерованы подряд', () => {
    const stages = nodes.filter((n) => n.data.role === 'stage').map((n) => Number(n.data.stage)).sort();
    expect(stages).toEqual([1, 2, 3, 4, 5]);
  });

  it('каждая ссылка на материал в front matter существует на основном сайте', () => {
    for (const n of nodes) for (const key of (n.data.materials as string[]) ?? []) expect(materials[key], `${n.slug}: ${key}`).toBeTruthy();
  });

  it('ссылки в тексте ведут на существующие узлы и материалы, чужих корневых путей нет', () => {
    for (const n of nodes) {
      for (const m of n.body.matchAll(/\]\(([^)\s]+)\)/g)) {
        const href = m[1];
        if (href.startsWith('#') || /^https?:\/\/(?!aleksishmanov\.ru)/.test(href) || href.startsWith('mailto:')) continue;
        const node = href.match(/^\/method\/([^/#]*)\/?(?:#.*)?$/);
        if (node) {
          if (node[1]) expect(slugs.has(node[1]), `${n.slug}: узел ${href}`).toBe(true);
          continue;
        }
        const mat = href.match(/^https:\/\/aleksishmanov\.ru\/(blog|reviews|tools|prompts|slides|cases)\/([^/#]+)\/?/);
        if (mat) { expect(materials[`${mat[1]}/${mat[2]}`], `${n.slug}: материал ${href}`).toBeTruthy(); continue; }
        if (/^https:\/\/aleksishmanov\.ru\/[a-z-]*\/?$/.test(href)) continue; // индексы разделов основного сайта
        throw new Error(`${n.slug}: неожиданная ссылка ${href}`);
      }
    }
  });
});

describe('таблица старых адресов /method/', () => {
  it('ведёт только на существующие страницы подсайта', () => {
    const O = 'https://po-system.aleksishmanov.ru';
    const targets = new Set([`${O}/method/`, ...[...slugs].map((s) => `${O}/method/${s}/`)]);
    for (const [from, to] of Object.entries(redirects)) {
      expect(from.startsWith('/method/'), from).toBe(true);
      expect(targets.has(to), `${from} → ${to}`).toBe(true);
    }
  });

  it('перенесённые узлы сохраняют свой адрес, корень идёт на карту', () => {
    const O = 'https://po-system.aleksishmanov.ru';
    expect(redirects['/method/']).toBe(`${O}/method/`);
    for (const s of slugs) if (s !== 'it-departament') expect(redirects[`/method/${s}/`]).toBe(`${O}/method/${s}/`);
  });
});
