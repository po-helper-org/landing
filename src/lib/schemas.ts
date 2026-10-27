// Схемы контента подсайта. Лежат отдельно от content.config.ts, чтобы их читали и сборка, и Vitest.
import { z } from 'astro/zod';

/** Узел диаграммы процесса: шаг (кто делает — who), развилка с вариантами, гейт, начало или конец. */
export const flowNode = z.object({
  title: z.string(),
  kind: z.enum(['start', 'step', 'fork', 'gate', 'end']).default('step'),
  who: z.enum(['po', 'agent', 'team', 'business']).optional(),
  step: z.number().optional(),
  text: z.string().optional(),
  options: z.array(z.string()).default([]),
});

/** Узел методологии: проблема → области → темы. Связь с материалами aleksishmanov.ru хранится в узле (`materials`). */
export const methodNode = z.object({
  title: z.string().min(3),
  /** Ключевой вопрос, на который отвечает узел. */
  question: z.string().min(10),
  description: z.string().min(10).max(320),
  level: z.enum(['problem', 'area', 'topic']),
  /** slug родителя; у корня — пусто. */
  parent: z.string().optional(),
  order: z.number().default(100),
  /** Подсайт держит только готовые узлы; draft и planned остаются в основном репозитории до переноса. */
  status: z.enum(['ready', 'draft', 'planned']).default('ready'),
  /** Прикреплённые материалы основного сайта: «<раздел>/<slug>». */
  materials: z.array(z.string()).default([]),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  /** Место области в процессе: стадия потока, ответвление или основание под всеми стадиями. */
  role: z.enum(['stage', 'branch', 'foundation']).optional(),
  stage: z.number().optional(),
  /** Короткое имя для диаграмм: «Вход», «Решение». */
  short: z.string().optional(),
  summary: z.string().optional(),
  flow: z.array(flowNode).default([]),
  /** Гейт на выходе стадии: когда стадия пройдена. */
  gate: z.object({ title: z.string(), criteria: z.array(z.string()).default([]) }).optional(),
});

export const WIDGET_STATUS = ['работает', 'в разработке', 'заморожен', 'закрытый'] as const;
export const WIDGET_TYPE = ['навык', 'агент', 'плагин харнесса', 'воркфлоу'] as const;

/** Виджет: возможность автоматизации, подключаемая к экосистеме po-helper-org (CONTEXT.md основного репозитория). */
export const widget = z
  .object({
    title: z.string().min(3),
    /** Какую задачу снимает. */
    task: z.string().min(10).max(300),
    /** Кому помогает. */
    audience: z.string().min(3),
    status: z.enum(WIDGET_STATUS),
    type: z.enum(WIDGET_TYPE),
    /** Публичный репозиторий; у закрытого виджета ссылки быть не может. */
    repo: z.string().url().optional(),
    /** Узлы методологии (slug), которые автоматизирует виджет. */
    nodes: z.array(z.string()).min(1),
    /** Заметка для закрытых виджетов: чем занимается, без имён и ссылок. */
    note: z.string().optional(),
    order: z.number().default(100),
  })
  .refine((w) => w.status !== 'закрытый' || !w.repo, { message: 'у закрытого виджета не может быть ссылки на репозиторий', path: ['repo'] })
  .refine((w) => w.status !== 'закрытый' || Boolean(w.note), { message: 'у закрытого виджета нужна заметка note', path: ['note'] });
