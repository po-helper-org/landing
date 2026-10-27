import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export interface Doc { slug: string; data: Record<string, unknown>; body: string }

/** Читает markdown-файлы каталога: front matter → объект, остальное — тело. */
export function readDocs(dir: string): Doc[] {
  const base = path.resolve(dir);
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const raw = fs.readFileSync(path.join(base, f), 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!m) throw new Error(`${f}: нет front matter`);
      return { slug: f.replace(/\.md$/, ''), data: parse(m[1]) as Record<string, unknown>, body: m[2] };
    });
}

export const materials: Record<string, { title: string; type: string; url: string }> = JSON.parse(
  fs.readFileSync('src/data/materials.json', 'utf8'),
);
