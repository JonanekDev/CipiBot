import type { FastifyInstance } from 'fastify';
import { Leaderboard } from '@cipibot/schemas';
import { LevelingService } from './service';

interface LeaderboardParams {
  id: string;
}

export async function registerLevelingRoutes(
  app: FastifyInstance,
  service: LevelingService,
): Promise<void> {
  app.get<{ Params: LeaderboardParams }>('/leaderboards/:id', async (request) => {
    const { id } = request.params;
    return Leaderboard.parse(await service.getLeaderboard(id));
  });
}
