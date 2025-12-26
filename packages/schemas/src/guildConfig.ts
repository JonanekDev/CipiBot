import { z } from 'zod';
import { EmbedSchema } from './discord';
import { SUPPORTED_LANGUAGES } from '@cipibot/i18n';
import { LevelingConfigSchema } from './leveling';
import { withDefaults } from './defaults';

export const WelcomeConfigSchema = z.object({
  enabled: z.boolean().default(true),
  welcomeEnabled: z.boolean().default(true),
  leaveEnabled: z.boolean().default(true),
  welcomeMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
  leaveMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
  channelId: z.union([z.string(), EmbedSchema]).nullable().default(null),
});

export const GuildConfigSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES).default('en'),
  leveling: withDefaults(LevelingConfigSchema),
  welcome: withDefaults(WelcomeConfigSchema),
});
export type GuildConfigType = z.infer<typeof GuildConfigSchema>;

// Partial schema for PATCH requests - all fields are optional
export const GuildConfigPatchSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
  leveling: LevelingConfigSchema.partial().optional(),
  welcome: WelcomeConfigSchema.partial().optional(),
});
export type GuildConfigPatchType = z.infer<typeof GuildConfigPatchSchema>;

// DeepPartial utility typ
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
