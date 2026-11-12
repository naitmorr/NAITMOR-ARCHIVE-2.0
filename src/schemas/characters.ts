import { z } from 'astro/zod';
import { archiveReference, commonShape, imageSchema, text, validateCommon } from './common.ts';

export const characterSchema = z.object({
  ...commonShape,
  aliases: z.array(text).max(30).default([]),
  titles: z.array(text).max(20).default([]),
  species: text.optional(),
  affiliations: z.array(text).max(20).default([]),
  inWorldStatus: z.enum(['unknown', 'alive', 'dead', 'missing', 'other']).default('unknown'),
  portrait: imageSchema.optional(),
  lifespan: z.object({ birthLabel: text.optional(), deathLabel: text.optional() }).strict().optional(),
  relationships: z.array(z.object({
    character: archiveReference('characters'),
    kind: z.enum(['ally', 'opponent', 'family', 'other']),
    description: text.optional(),
  }).strict()).max(100).default([]),
}).strict().superRefine(validateCommon);
