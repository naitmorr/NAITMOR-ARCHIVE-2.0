import { z } from 'astro/zod';
import { commonShape, text, validateCommon } from './common.ts';

export const dossierSchema = z.object({
  ...commonShape,
  archiveCode: z.string().regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)+$/).max(60),
  classification: z.enum(['classified', 'redacted', 'fragment']).default('classified'),
  discovery: z.enum(['listed', 'unlisted']).default('unlisted'),
  spoiler: z.boolean().default(true),
  unlockHint: text.optional(),
}).strict().superRefine(validateCommon);
