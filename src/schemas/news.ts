import { z } from 'astro/zod';
import { commonShape, imageSchema, text, validateCommon } from './common.ts';

export const newsSchema = z.object({
  ...commonShape,
  publishedAt: z.iso.datetime({ offset: true }),
  author: text.optional(),
  cover: imageSchema.optional(),
  featured: z.boolean().default(false),
}).strict().superRefine((data, ctx) => {
  validateCommon(data, ctx);
  if (data.updatedAt && Date.parse(data.updatedAt) < Date.parse(data.publishedAt)) {
    ctx.addIssue({ code: 'custom', path: ['updatedAt'], message: 'updatedAt cannot precede publishedAt.' });
  }
});
