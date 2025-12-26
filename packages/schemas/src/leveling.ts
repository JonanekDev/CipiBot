import z, { custom } from 'zod';
import { EmbedSchemna } from './discord';
import { CommandSchema } from './commands';
import { withDefaults } from './defaults';

export const LeaderboardCommandSchema = CommandSchema.extend({
  leaderboardEntry: z.string().nullable().default(null),
});

export type LeaderboardCommandType = z.infer<typeof LeaderboardCommandSchema>;

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
  xpMultiplier: z.number().min(0.1).max(10).default(1.0),
  webLeaderboardEnabled: z.boolean().default(true),
  commands: withDefaults(
    z.object({
      level: withDefaults(CommandSchema),
      leaderboard: withDefaults(LeaderboardCommandSchema),
    }),
  ),
});

export type LevelingConfigType = z.infer<typeof LevelingConfigSchema>;
