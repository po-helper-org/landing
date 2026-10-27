// Методология: дерево узлов «проблема → области → темы» и связь узлов с материалами основного сайта.
import { getCollection, type CollectionEntry } from 'astro:content';
import materials from '../data/materials.json';
import { href } from './site';

export type MethodNode = CollectionEntry<'method'>;
export type Material = { key: string; title: string; type: string; url: string };

export const METHOD_PATH = '/method/';

/** Адрес узла: корень — /method/, остальные — /method/<slug>/. */
export const nodeUrl = (n: MethodNode) => href(n.data.level === 'problem' ? METHOD_PATH : `${METHOD_PATH}${n.id}/`);

const byOrder = (a: MethodNode, b: MethodNode) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

export async function allNodes(): Promise<MethodNode[]> {
  return (await getCollection('method')).sort(byOrder);
}

export async function root(): Promise<MethodNode> {
  const r = (await allNodes()).find((n) => n.data.level === 'problem');
  if (!r) throw new Error('методология: нет корневого узла level: problem');
  return r;
}

export const childrenOf = (nodes: MethodNode[], id: string) => nodes.filter((n) => n.data.parent === id).sort(byOrder);

/** Цепочка от корня до узла (без самого узла). */
export function ancestors(nodes: MethodNode[], n: MethodNode): MethodNode[] {
  const chain: MethodNode[] = [];
  let cur = nodes.find((x) => x.id === n.data.parent);
  while (cur) { chain.unshift(cur); cur = nodes.find((x) => x.id === cur!.data.parent); }
  return chain;
}

/** Материалы узла основного сайта в порядке, заданном в узле. */
export function materialsOf(n: MethodNode): Material[] {
  const index = materials as Record<string, Omit<Material, 'key'>>;
  return n.data.materials.map((key) => ({ key, ...index[key] })).filter((m) => m.url);
}

export type Role = NonNullable<MethodNode['data']['role']>;
/** Области по месту в процессе: стадии по номеру, затем основания и ответвления. */
export function byRole(nodes: MethodNode[], role: Role): MethodNode[] {
  return nodes.filter((n) => n.data.level === 'area' && n.data.role === role).sort((a, b) => (a.data.stage ?? a.data.order) - (b.data.stage ?? b.data.order));
}
