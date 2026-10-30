import type { APIRoute } from 'astro';
import { allPages } from '../lib/pages';

// Карта сайта подсайта; основной сайт подхватывает этот файл в свою общую карту.
export const GET: APIRoute = async () => {
  const pages = await allPages();
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const body = pages
    .map((p) => `  <url><loc>${esc(p.url)}</loc>${p.updated ? `<lastmod>${p.updated.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`)
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
