import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { archiveSchemas } from './schemas/index.ts';
import type { ArchiveCollection } from './schemas/common.ts';

function loader(collection: ArchiveCollection) {
  return glob({
    base: `./src/content/${collection}`,
    pattern: '**/*.{md,mdx,json,yaml,yml}',
    generateId: ({ entry }) => entry.replace(/\.(md|mdx|json|ya?ml)$/, ''),
  });
}

export const collections = {
  characters: defineCollection({ loader: loader('characters'), schema: archiveSchemas.characters }),
  lore: defineCollection({ loader: loader('lore'), schema: archiveSchemas.lore }),
  timeline: defineCollection({ loader: loader('timeline'), schema: archiveSchemas.timeline }),
  music: defineCollection({ loader: loader('music'), schema: archiveSchemas.music }),
  gallery: defineCollection({ loader: loader('gallery'), schema: archiveSchemas.gallery }),
  news: defineCollection({ loader: loader('news'), schema: archiveSchemas.news }),
  dossiers: defineCollection({ loader: loader('dossiers'), schema: archiveSchemas.dossiers }),
};
