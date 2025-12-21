import z from 'zod';

export const LeaderboardEntry = z.object({
  userId: z.string(),
  level: z.number().int(),
  xp: z.number().int(),
  messageCount: z.number().int(),
  left: z.boolean(),
});

export const Leaderboard = z.array(LeaderboardEntry);

export type LeaderboardEntryType = z.infer<typeof LeaderboardEntry>;
