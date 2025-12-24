import { initTRPC } from '@trpc/server';
import { LevelingService } from './service';
import { z, Leaderboard } from '@cipibot/schemas';

const t = initTRPC.create();

export function createLevelingRouter(service: LevelingService) {
  return t.router({
    getWebLeaderboard: t.procedure
      .input(z.object({ guildId: z.string() }))
      .query(async ({ input }) => {
        const data = await service.getWebLeaderboard(input.guildId);
        return Leaderboard.parse(data);
      }),
    getUserStats: t.procedure
      .input(z.object({ guildId: z.string(), userId: z.string() }))
      .query(async ({ input }) => {
        return await service.getUserStats(input.guildId, input.userId);
      }),
  });
}

export type LevelingRouter = ReturnType<typeof createLevelingRouter>;
