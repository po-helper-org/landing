import type { APIRoute } from 'astro';
import { allPages } from '../lib/pages';
import { SITE } from '../lib/site';

// Список страниц подсайта для ИИ-ассистентов; основной сайт добавляет его в свой llms.txt.
export const GET: APIRoute = async () => {
  const pages = await allPages();
  const groups = ['Главная', 'Методология', 'Виджеты'] as const;
  const out = [`# ${SITE.name}: ${SITE.tagline}`, '', `> ${SITE.subtitle} Проблема, вокруг которой всё построено: ${SITE.problem}`, ''];
  for (const g of groups) {
    out.push(`## ${g}`, '');
    for (const p of pages.filter((x) => x.group === g)) out.push(`- [${p.title}](${p.url}): ${p.description}`);
    out.push('');
  }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
