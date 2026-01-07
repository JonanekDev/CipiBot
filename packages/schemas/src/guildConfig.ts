import { z } from 'zod';
import { EmbedSchema } from './discord/embeds';
import { SUPPORTED_LANGUAGES } from '@cipibot/i18n';
import { LevelingConfigSchema } from './modules/leveling';
import { withDefaults } from './defaults';
import { WelcomingConfigSchema } from './modules/welcoming';
import { TicketingConfigSchema } from './modules/ticketing';

export const GuildConfigSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES).default('en'),
  leveling: withDefaults(LevelingConfigSchema),
  welcoming: withDefaults(WelcomingConfigSchema),
  ticketing: withDefaults(TicketingConfigSchema),
});
export type GuildConfigType = z.infer<typeof GuildConfigSchema>;

export const GuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  config: withDefaults(GuildConfigSchema),
  removed: z.boolean().default(false),
});
export type Guild = z.infer<typeof GuildSchema>;

// Partial schema for PATCH requests - all fields are optional
export const GuildConfigPatchSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
  leveling: LevelingConfigSchema.partial().optional(),
  welcoming: WelcomingConfigSchema.partial().optional(),
  ticketing: TicketingConfigSchema.partial().optional(),
});
export type GuildConfigPatchType = z.infer<typeof GuildConfigPatchSchema>;

// DeepPartial utility typ
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? U[] // Array items cannot be undefined, but array can be empty
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};
