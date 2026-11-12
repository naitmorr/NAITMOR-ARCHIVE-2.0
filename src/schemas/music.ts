import { z } from 'astro/zod';
import { archiveReference, audioSchema, commonShape, imageSchema, platformLinkSchema, text, validateCommon } from './common.ts';

const sharedMusicShape = {
  ...commonShape,
  artist: text,
  genres: z.array(text).max(20).default([]),
  platformLinks: z.array(platformLinkSchema).max(20).default([]),
  credits: z.array(z.object({ name: text, role: text }).strict()).max(100).default([]),
};

const releaseSchema = z.object({
  ...sharedMusicShape,
  kind: z.literal('release'),
  format: z.enum(['album', 'ep', 'single', 'compilation']),
  releaseStatus: z.enum(['announced', 'released']),
  releaseDate: z.iso.date().optional(),
  cover: imageSchema.optional(),
  catalogNumber: z.string().regex(/^[A-Z0-9][A-Z0-9._-]{1,49}$/).optional(),
  tracklist: z.array(z.object({
    track: archiveReference('music'),
    disc: z.number().int().positive().default(1),
    position: z.number().int().positive(),
  }).strict()).max(500).default([]),
}).strict();

const trackSchema = z.object({
  ...sharedMusicShape,
  kind: z.literal('track'),
  version: text.optional(),
  durationSeconds: z.number().int().positive().max(86400).optional(),
  isrc: z.string().regex(/^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/).optional(),
  audio: audioSchema.optional(),
  lyrics: z.string().trim().min(1).max(50000).optional(),
}).strict();

export const musicSchema = z.discriminatedUnion('kind', [releaseSchema, trackSchema]).superRefine((data, ctx) => {
  validateCommon(data, ctx);
  if (data.kind === 'release') {
    if (data.releaseStatus === 'released' && (!data.releaseDate || data.tracklist.length === 0)) {
      ctx.addIssue({ code: 'custom', message: 'Released music requires a releaseDate and a nonempty tracklist.' });
    }
    const positions = data.tracklist.map((item) => `${item.disc}:${item.position}`);
    if (new Set(positions).size !== positions.length) {
      ctx.addIssue({ code: 'custom', path: ['tracklist'], message: 'Duplicate track positions on the same disc.' });
    }
  } else if (!data.demo && !data.draft && !data.durationSeconds) {
    ctx.addIssue({ code: 'custom', path: ['durationSeconds'], message: 'A published track requires its duration.' });
  }
});
