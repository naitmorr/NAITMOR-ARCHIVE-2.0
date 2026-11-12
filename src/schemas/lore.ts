import { z } from 'astro/zod';
import { archiveReference, commonShape, imageSchema, validateCommon } from './common.ts';

export const loreSchema = z.object({
  ...commonShape,
  kind: z.enum(['history', 'world', 'location', 'faction', 'artifact', 'concept', 'era']),
  parent: archiveReference('lore').optional(),
  cover: imageSchema.optional(),
  order: z.number().int().optional(),
}).strict().superRefine(validateCommon);
