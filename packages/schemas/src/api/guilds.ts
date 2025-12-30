import z from 'zod';
import { OkResponseSchema } from './response';

export const UserGuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  owner: z.boolean(),
  permissions: z.number(),
  isKnown: z.boolean().default(false),
  approximate_member_count: z.number().int().optional(),
});

export type UserGuild = z.infer<typeof UserGuildSchema>;

export const UserGuildResSchema = OkResponseSchema(z.array(UserGuildSchema));

export type UserGuildRes = z.infer<typeof UserGuildResSchema>;
