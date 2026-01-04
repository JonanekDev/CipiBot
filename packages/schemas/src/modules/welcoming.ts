import z from 'zod';
import { EmbedSchema } from '../discord/embeds';
import { BaseModuleSchema } from './base';

export const WelcomingConfigSchema = BaseModuleSchema.extend({
  enabled: z.boolean().default(false),
  welcomeEnabled: z.boolean().default(true),
  leaveEnabled: z.boolean().default(true),
  welcomeMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
  leaveMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
  channelId: z.string().nullable().default(null),
  dmEnabled: z.boolean().default(false),
  dmWelcomeMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
});

export type WelcomingConfig = z.infer<typeof WelcomingConfigSchema>;
