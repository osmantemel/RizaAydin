import { z } from 'zod';
export const entityId = z.string().regex(/^[a-f0-9]{16,24}$/);
const text = (max, min = 1) => z.string().trim().min(min).max(max);
export const settingsSchema = z.object({
  action: z.literal('settings'),
  headline: text(150),
  intro: text(1000),
  hours: text(200, 0),
  about: text(3000),
});
export const postSchema = z.object({
  action: z.literal('post'),
  id: z.union([entityId, z.literal('')]).optional(),
  title: text(150),
  text: text(15000),
  district: text(100, 0),
  kind: z.enum(['Yapılan iş', 'Ustadan notlar']),
  image: z
    .string()
    .max(600)
    .refine(
      (v) => v === '' || /^\/media\/[a-f0-9]{32}\.webp$/.test(v),
      'Yüklenen bir fotoğraf seçin.',
    ),
  published: z.boolean(),
});
export const reviewSchema = z.object({
  name: text(60),
  text: text(1500, 10),
  rating: z.coerce.number().int().min(1).max(5),
  consent: z.literal(true),
  website: z.string().max(100).optional(),
});
export const serviceSchema = z.object({ title: text(100), summary: text(250), text: text(5000) });
