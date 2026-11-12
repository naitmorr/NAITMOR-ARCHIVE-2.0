import { getCollection, type CollectionEntry } from 'astro:content';
import type { ArchiveCollection } from '../schemas/common.ts';
import type { Locale } from '../i18n/config.ts';
import { isPublished } from './content-policy.ts';

/** Production queries never include drafts, DEMO, or another locale. */
export async function getArchiveEntries<C extends ArchiveCollection>(collection: C, locale: Locale): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection);
  return entries.filter((entry) => entry.data.locale === locale && isPublished(entry.data));
}

/** Explicit editorial preview, separate from production queries. */
export async function getPreviewEntries<C extends ArchiveCollection>(collection: C, locale: Locale): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection);
  return entries.filter((entry) => entry.data.locale === locale);
}

export async function getCatalogEntries<C extends ArchiveCollection>(collection: C, locale: Locale): Promise<CollectionEntry<C>[]> {
  return (await getArchiveEntries(collection, locale)).filter((entry) => !('discovery' in entry.data) || entry.data.discovery === 'listed');
}

export async function getSearchEntries(locale: Locale) {
  const collections = ['characters', 'lore', 'timeline', 'music', 'gallery', 'news'] as const;
  return (await Promise.all(collections.map((collection) => getArchiveEntries(collection, locale)))).flat();
}

export async function getTranslation<C extends ArchiveCollection>(collection: C, translationKey: string, locale: Locale): Promise<CollectionEntry<C> | undefined> {
  const entries = await getArchiveEntries(collection, locale);
  return entries.find((candidate) => candidate.data.translationKey === translationKey);
}

export async function resolveArchiveReference<C extends ArchiveCollection>(reference: { collection: C; id: string }, locale: Locale): Promise<CollectionEntry<C> | undefined> {
  const entries = await getArchiveEntries(reference.collection, locale);
  return entries.find((entry) => entry.id === reference.id);
}

type MusicEntry = CollectionEntry<'music'>;
export type ReleaseEntry = Omit<MusicEntry, 'data'> & { data: Extract<MusicEntry['data'], { kind: 'release' }> };
export type TrackEntry = Omit<MusicEntry, 'data'> & { data: Extract<MusicEntry['data'], { kind: 'track' }> };

export async function getReleases(locale: Locale): Promise<ReleaseEntry[]> {
  return (await getArchiveEntries('music', locale)).filter((entry): entry is ReleaseEntry => entry.data.kind === 'release');
}

export async function getTracks(locale: Locale): Promise<TrackEntry[]> {
  return (await getArchiveEntries('music', locale)).filter((entry): entry is TrackEntry => entry.data.kind === 'track');
}

export async function getTimelineEntries(locale: Locale) {
  return (await getArchiveEntries('timeline', locale)).sort((left, right) => left.data.orderKey - right.data.orderKey || left.id.localeCompare(right.id));
}
