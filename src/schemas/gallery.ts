import { z } from 'astro/zod';
import { commonShape, httpsURL, imageSchema, text, validateCommon } from './common.ts';

export const gallerySchema = z.object({
  ...commonShape,
  kind: z.enum(['illustration', 'portrait', 'concept', 'cover', 'other']),
  image: imageSchema.optional(),
  creators: z.array(z.object({ name: text, url: httpsURL.optional() }).strict()).min(1).max(20),
  createdOn: z.iso.date().optional(),
  medium: text.optional(),
}).strict().superRefine((data, ctx) => {
  validateCommon(data, ctx);
  if (!data.demo && !data.draft && !data.image) {
    ctx.addIssue({ code: 'custom', path: ['image'], message: 'A published gallery entry requires an image. DEMO metadata may omit it.' });
  }
});
