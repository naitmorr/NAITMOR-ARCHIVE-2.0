import type { Locale } from './config.ts';
import type { ArchiveCollection } from '../schemas/common.ts';
import { withBase } from '../lib/urls.ts';

const sections: Record<ArchiveCollection, string> = {
  characters: 'characters', lore: 'lore', timeline: 'timeline', music: 'music',
  gallery: 'gallery', news: 'news', dossiers: 'classified',
};

export function localizedPath(path: string, locale: Locale): string {
  const relative = path.replace(/^\/+/, '');
  return withBase(locale === 'ru' ? relative : `en/${relative}`);
}

/** Route contract for the next stage; this function does not create pages. */
export function getContentUrl(entry: {
  collection: ArchiveCollection;
  data: { locale: Locale; entryKey: string; kind?: string };
}): string {
  const section = entry.collection === 'music'
    ? `music/${entry.data.kind === 'release' ? 'releases' : 'tracks'}`
    : sections[entry.collection];
  return localizedPath(`${section}/${entry.data.entryKey}/`, entry.data.locale);
}
