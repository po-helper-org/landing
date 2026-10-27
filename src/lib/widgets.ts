// Виджеты экосистемы: витрина по стадиям процесса и привязка к узлам методологии.
import { getCollection, type CollectionEntry } from 'astro:content';
import { allNodes, byRole, nodeUrl, type MethodNode } from './method';
import { href } from './site';

export type Widget = CollectionEntry<'widgets'>;

export const widgetUrl = (w: Widget) => href(`/widgets/${w.id}/`);

const STATUS_ORDER = ['работает', 'в разработке', 'заморожен', 'закрытый'];

export async function allWidgets(): Promise<Widget[]> {
  return (await getCollection('widgets')).sort(
    (a, b) => STATUS_ORDER.indexOf(a.data.status) - STATUS_ORDER.indexOf(b.data.status) || a.data.order - b.data.order,
  );
}

export const isPrivate = (w: Widget) => w.data.status === 'закрытый';

/** Виджеты, которые автоматизируют узел методологии. */
export async function widgetsOfNode(nodeId: string): Promise<Widget[]> {
  return (await allWidgets()).filter((w) => w.data.nodes.includes(nodeId));
}

export interface Group { key: string; title: string; hint: string; url: string; widgets: Widget[] }

/** Группы витрины: стадии по порядку, затем основания и ответвление. Виджет стоит в группе своего первого узла. */
export async function groupsByStage(): Promise<Group[]> {
  const nodes = await allNodes();
  const widgets = (await allWidgets()).filter((w) => !isPrivate(w));
  const place = new Map<string, string>();
  const groups: Group[] = [];
  const add = (n: MethodNode, title: string) => {
    groups.push({ key: n.id, title, hint: n.data.question, url: nodeUrl(n), widgets: [] });
  };
  for (const s of byRole(nodes, 'stage')) add(s, `${s.data.stage}. ${s.data.short}`);
  for (const f of byRole(nodes, 'foundation')) add(f, `Основание: ${f.data.short}`);
  for (const b of byRole(nodes, 'branch')) add(b, b.data.short ?? b.data.title);
  for (const g of groups) place.set(g.key, g.key);
  for (const w of widgets) {
    const target = groups.find((g) => g.key === w.data.nodes[0]);
    if (target) target.widgets.push(w);
  }
  return groups.filter((g) => g.widgets.length > 0);
}
