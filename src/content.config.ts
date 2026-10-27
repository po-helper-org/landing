import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { methodNode, widget } from './lib/schemas';

export const collections = {
  method: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/method' }), schema: methodNode }),
  widgets: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/widgets' }), schema: widget }),
};
