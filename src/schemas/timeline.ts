import { z } from 'astro/zod';
import { archiveReference, commonShape, text, validateCommon } from './common.ts';

export const timelineSchema = z.object({
  ...commonShape,
  dateLabel: text,
  orderKey: z.number(),
  endOrderKey: z.number().optional(),
  era: archiveReference('lore').optional(),
  participants: z.array(archiveReference('characters')).max(100).default([]),
  importance: z.enum(['minor', 'major', 'turning-point']).default('minor'),
}).strict().superRefine((data, ctx) => {
  validateCommon(data, ctx);
  if (data.endOrderKey !== undefined && data.endOrderKey < data.orderKey) {
    ctx.addIssue({ code: 'custom', path: ['endOrderKey'], message: 'The end of an event cannot precede its start.' });
  }
});
