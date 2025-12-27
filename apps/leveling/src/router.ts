import { initTRPC } from '@trpc/server';
import { LevelingService } from './service';
import { z } from '@cipibot/schemas';

const t = initTRPC.create();

export function createLevelingRouter(service: LevelingService) {
  return t.router({
    getWebLeaderboard: t.procedure
      .input(z.object({ guildId: z.string() }))
      .query(async ({ input }) => {
        return await service.getWebLeaderboard(input.guildId);
      }),
    getUser: t.procedure
      .input(z.object({ guildId: z.string(), userId: z.string() }))
      .query(async ({ input }) => {
        return await service.getUser(input.guildId, input.userId);
      }),
  });
}

export type LevelingRouter = ReturnType<typeof createLevelingRouter>;
