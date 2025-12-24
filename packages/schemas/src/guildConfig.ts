import { z } from 'zod';
import { EmbedSchemna } from './discord';

export const LevelingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  levelUpMessage: z.union([z.string(), EmbedSchemna]).nullable().default(null),
  levelUpMessageChannelId: z.string().nullable().default(null),
  ignoreChannelIds: z.array(z.string()).default([]),
  roleRewards: z
    .record(
      // Key must be a string (because JSON), but validate it's a number string
      z.string().refine((val) => !isNaN(Number(val)), {
        message: 'Level must be a number string',
      }),
      z.string(), // Role ID
    )
    .default({}),
  xpPerWord: z.number().min(0).max(50).default(1), // XP awarded per word in a message
  xpPerMessage: z.number().min(0).max(50).default(5), // Base XP awarded per message
  maxXPPersMessage: z.number().min(1).max(200).default(40), // Maximum XP that can be earned from a single message
  cooldownSeconds: z.number().min(0).max(3600).default(15), // Cooldown period in seconds between XP awards
  xpMultiplier: z.number().min(0.1).max(10).default(1.0),
  webLeaderboardEnabled: z.boolean().default(true),
});

export const WelcomeConfigSchema = z.object({
  enabled: z.boolean().default(true),
  welcomeEnabled: z.boolean().default(true),
  leaveEnabled: z.boolean().default(true),
  welcomeMessage: z.union([z.string(), EmbedSchemna]).nullable().default(null),
  leaveMessage: z.union([z.string(), EmbedSchemna]).nullable().default(null),
  channelId: z.union([z.string(), EmbedSchemna]).nullable().default(null),
});

export const GuildConfigSchema = z.object({
  language: z.string().default('en'),
  leveling: LevelingConfigSchema.optional().transform((v) => LevelingConfigSchema.parse(v ?? {})),
  welcome: WelcomeConfigSchema.optional().transform((v) => WelcomeConfigSchema.parse(v ?? {})),
});
export type GuildConfigType = z.infer<typeof GuildConfigSchema>;

// Partial schema for PATCH requests - all fields are optional
export const GuildConfigPatchSchema = z.object({
  language: z.string().optional(),
  leveling: LevelingConfigSchema.partial().optional(),
  welcome: WelcomeConfigSchema.partial().optional(),
});
export type GuildConfigPatchType = z.infer<typeof GuildConfigPatchSchema>;

// DeepPartial utility typ
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
