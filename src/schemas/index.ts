import type { z } from 'astro/zod';
import { characterSchema } from './characters.ts';
import { loreSchema } from './lore.ts';
import { timelineSchema } from './timeline.ts';
import { musicSchema } from './music.ts';
import { gallerySchema } from './gallery.ts';
import { newsSchema } from './news.ts';
import { dossierSchema } from './dossiers.ts';
import type { ArchiveCollection } from './common.ts';

export const archiveSchemas = {
  characters: characterSchema,
  lore: loreSchema,
  timeline: timelineSchema,
  music: musicSchema,
  gallery: gallerySchema,
  news: newsSchema,
  dossiers: dossierSchema,
};

export type ArchiveData<C extends ArchiveCollection = ArchiveCollection> = z.output<(typeof archiveSchemas)[C]>;
export type ArchiveRecord<C extends ArchiveCollection = ArchiveCollection> = {
  [K in C]: {
    collection: K;
    id: string;
    data: ArchiveData<K>;
    filePath: string;
    body: string;
  }
}[C];
