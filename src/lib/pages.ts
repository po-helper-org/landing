// Перечень страниц подсайта для карты сайта и llms-po-system.txt.
import { allNodes, nodeUrl } from './method';
import { allWidgets, widgetUrl } from './widgets';
import { SITE, href } from './site';

export interface PageInfo { url: string; title: string; description: string; group: 'Главная' | 'Методология' | 'Виджеты'; updated?: Date }

const abs = (path: string) => new URL(path, SITE.origin).href;

export async function allPages(): Promise<PageInfo[]> {
  const nodes = await allNodes();
  const widgets = await allWidgets();
  const root = nodes.find((n) => n.data.level === 'problem')!;
  return [
    { url: abs(href('/')), title: `${SITE.name} — ${SITE.tagline}`, description: SITE.subtitle, group: 'Главная' },
    { url: abs(href('/method/')), title: root.data.title, description: root.data.description, group: 'Методология', updated: root.data.updated ?? root.data.date },
    ...nodes.filter((n) => n.data.level !== 'problem').map((n) => ({ url: abs(nodeUrl(n)), title: n.data.title, description: n.data.description, group: 'Методология' as const, updated: n.data.updated ?? n.data.date })),
    { url: abs(href('/widgets/')), title: 'Виджеты экосистемы po-helper-org', description: 'Возможности автоматизации, подключаемые к экосистеме: задача, аудитория и статус каждого виджета.', group: 'Виджеты' },
    ...widgets.map((w) => ({ url: abs(widgetUrl(w)), title: w.data.title, description: w.data.task, group: 'Виджеты' as const })),
  ];
}
