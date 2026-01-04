import z from 'zod';

export const EmbedSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  author: z
    .object({
      name: z.string(),
      url: z.string().optional(),
      icon_url: z.string().optional(),
    })
    .optional(),
  color: z.number().int().optional(),
  url: z.string().optional(),
  fields: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        inline: z.boolean().optional(),
      }),
    )
    .optional(),
  footer: z
    .object({
      text: z.string(),
      icon_url: z.string().optional(),
    })
    .optional(),
  image: z
    .object({
      url: z.string(),
    })
    .optional(),
  thumbnail: z
    .object({
      url: z.string(),
    })
    .optional(),
});

export type Embed = z.infer<typeof EmbedSchema>;
