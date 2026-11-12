import { z } from 'astro/zod';
import { locales } from '../i18n/config.ts';

export const collectionNames = ['characters', 'lore', 'timeline', 'music', 'gallery', 'news', 'dossiers'] as const;
export type ArchiveCollection = (typeof collectionNames)[number];
export const keySchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const text = z.string().trim().min(1).max(500);
export const httpsURL = z.url().refine((value) => new URL(value).protocol === 'https:', 'Only HTTPS URLs are allowed.');

/** Astro-compatible typed references. Graph validation checks target existence and locale. */
export function archiveReference<C extends ArchiveCollection>(collection: C) {
  return z.string().regex(/^(ru|en)\/[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .transform((id) => ({ collection, id }));
}

const tagList = z.array(keySchema).max(30).refine((tags) => new Set(tags).size === tags.length, 'Duplicate tags.').default([]);
export const relatedSchema = z.object({
  characters: z.array(archiveReference('characters')).default([]),
  lore: z.array(archiveReference('lore')).default([]),
  timeline: z.array(archiveReference('timeline')).default([]),
  music: z.array(archiveReference('music')).default([]),
  gallery: z.array(archiveReference('gallery')).default([]),
  news: z.array(archiveReference('news')).default([]),
  dossiers: z.array(archiveReference('dossiers')).default([]),
}).strict().default({ characters: [], lore: [], timeline: [], music: [], gallery: [], news: [], dossiers: [] });

export const commonShape = {
  locale: z.enum(locales),
  entryKey: keySchema,
  translationKey: keySchema,
  title: text,
  summary: text,
  draft: z.boolean().default(true),
  demo: z.boolean().default(false),
  tags: tagList,
  updatedAt: z.iso.datetime({ offset: true }).optional(),
  seo: z.object({ title: text.optional(), description: text.optional(), noindex: z.boolean().default(false) }).strict().optional(),
  related: relatedSchema,
};

type CommonInput = { demo: boolean; entryKey: string; translationKey: string; title: string };
export function validateCommon(data: CommonInput, ctx: z.RefinementCtx) {
  if (data.demo && (!data.title.startsWith('DEMO: ') || !data.entryKey.startsWith('demo-') || !data.translationKey.startsWith('demo-'))) {
    ctx.addIssue({ code: 'custom', message: 'DEMO entries require a DEMO: title and demo- entryKey/translationKey.' });
  }
  if (!data.demo && (data.entryKey.startsWith('demo-') || data.title.startsWith('DEMO:'))) {
    ctx.addIssue({ code: 'custom', message: 'DEMO markers require demo: true.' });
  }
}

export const imageSchema = z.object({
  src: z.string().regex(/^src\/assets\/images\/[a-zA-Z0-9_./-]+\.(avif|webp|png|jpe?g|svg)$/)
    .refine((src) => !src.split('/').includes('..'), 'Image paths cannot traverse directories.'),
  alt: text,
  credit: text.optional(),
  focalPoint: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).strict().optional(),
}).strict();

export const platformLinkSchema = z.object({
  platform: z.enum(['yandex-music', 'vk-music', 'spotify', 'apple-music', 'bandcamp', 'soundcloud', 'youtube', 'other']),
  url: httpsURL,
  label: text.optional(),
}).strict().superRefine((link, ctx) => {
  const host = new URL(link.url).hostname;
  const matches = (domain: string) => host === domain || host.endsWith(`.${domain}`);
  const valid = {
    'yandex-music': /^music\.yandex\.(ru|com|by|kz|uz)$/.test(host),
    'vk-music': matches('vk.com') || matches('vk.ru'),
    spotify: matches('spotify.com'),
    'apple-music': host === 'music.apple.com',
    bandcamp: matches('bandcamp.com'),
    soundcloud: matches('soundcloud.com'),
    youtube: matches('youtube.com') || host === 'youtu.be' || host === 'music.youtube.com',
    other: Boolean(link.label),
  }[link.platform];
  if (!valid) ctx.addIssue({ code: 'custom', message: 'Platform URL does not match its provider, or other has no label.' });
});

export const audioSchema = z.object({
  src: z.string().refine((value) => /^public\/audio\/previews\/[a-zA-Z0-9_/-]+\.(mp3|ogg|m4a|wav)$/.test(value) || httpsURL.safeParse(value).success, 'Expected a local preview path or HTTPS URL.')
    .refine((value) => !value.split('/').includes('..'), 'Audio paths cannot traverse directories.'),
  mime: z.enum(['audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/wav']),
}).strict();
