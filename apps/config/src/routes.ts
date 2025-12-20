import type { FastifyInstance } from 'fastify';
import { ConfigService } from './service';
import { GuildConfigPatchSchema, GuildConfigPatchType, z } from '@cipibot/schemas';

interface GuildParams {
  id: string;
}

export async function registerConfigRoutes(
  app: FastifyInstance,
  service: ConfigService,
): Promise<void> {
  app.get<{ Params: GuildParams }>('/guilds/:id/config', async (request) => {
    const { id } = request.params;
    return await service.getGuildConfig(id);
  });

  app.patch<{ Params: GuildParams; Body: GuildConfigPatchType }>(
    '/guilds/:id/config',
    async (request, reply) => {
      const { id } = request.params;

      try {
        const patch = GuildConfigPatchSchema.parse(request.body);
        return await service.updateGuildConfig(id, patch);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid configuration data',
            issues: error.issues,
          });
        }
        throw error;
      }
    },
  );
}
