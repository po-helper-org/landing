#!/usr/bin/env node
/**
 * Список материалов основного сайта (aleksishmanov.ru): ключ «<раздел>/<slug>» → название, тип, адрес.
 * Подсайт ссылается на материалы абсолютными адресами; список нужен тесту целостности и карточкам материалов.
 * Запуск: node scripts/sync-materials.mjs <путь к репозиторию aleksishmanov-landing>
 * Это единственное место, где подсайт читает основной репозиторий; результат лежит в src/data/materials.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const main = process.argv[2];
if (!main) { console.error('Укажите путь к репозиторию aleksishmanov-landing'); process.exit(1); }
const SECTIONS = ['blog', 'reviews', 'tools', 'prompts', 'slides', 'cases'];
const TYPE = { blog: 'Блог', reviews: 'Разбор', tools: 'Инструмент', prompts: 'Промт', slides: 'Презентация', cases: 'Кейс' };
const out = {};
for (const s of SECTIONS) {
  const dir = path.join(main, 'portal/src/content', s);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) continue;
    const fm = parse(m[1]);
    const slug = f.replace(/\.md$/, '');
    out[`${s}/${slug}`] = { title: String(fm.title ?? slug), type: TYPE[s], url: `https://aleksishmanov.ru/${s}/${slug}/` };
  }
}
const target = path.join(import.meta.dirname, '../src/data/materials.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log(`материалов: ${Object.keys(out).length}`);
