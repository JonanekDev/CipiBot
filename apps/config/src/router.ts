import { ConfigService } from './service';
import { GuildConfigPatchSchema, z } from '@cipibot/schemas';
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export function createConfigRouter(service: ConfigService) {
  return t.router({
    getGuildConfig: t.procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      return await service.getGuildConfig(input.id);
    }),
    getGuild: t.procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      return await service.getGuild(input.id);
    }),
    updateGuildConfig: t.procedure
      .input(
        z.object({
          id: z.string(),
          patch: GuildConfigPatchSchema,
        }),
      )
      .mutation(async ({ input }) => {
        return await service.updateGuildConfig(input.id, input.patch);
      }),
    filterKnownGuilds: t.procedure
      .input(z.object({ ids: z.array(z.string()) }))
      .query(async ({ input }) => {
        return await service.filterKnownGuilds(input.ids);
      }),
  });
}

export type ConfigRouter = ReturnType<typeof createConfigRouter>;
