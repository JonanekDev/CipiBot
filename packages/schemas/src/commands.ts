import z from 'zod';
import { EmbedSchema } from './discord';

export const CommandSchema = z.object({
  enabled: z.boolean().default(true),
  ephemeral: z.boolean().default(false),
  customMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
});

export type CommandType = z.infer<typeof CommandSchema>;
