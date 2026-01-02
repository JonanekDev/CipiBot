import { initTRPC } from '@trpc/server';
import { InteractionsService } from './services/interactions.service';
import z from 'zod';
import { DiscordInteractionReplyUpdateSchema } from '@cipibot/schemas';
import { ChannelsService } from './services/channels.service';
import { RolesService } from './services/roles.service';

const t = initTRPC.create();

export function createDiscordRestRouter(
  interactionService: InteractionsService,
  channelsService: ChannelsService,
  rolesService: RolesService,
) {
  return t.router({
    // Defer interaction and sendreply are tRPC endpoint bcs of Discord interaction time limits
    sendDeferCommandResponse: t.procedure
      .input(
        z.object({
          interactionId: z.string(),
          interactionToken: z.string(),
          ephemeral: z.boolean(),
        }),
      )
      .mutation(async ({ input }) => {
        return await interactionService.deferCommandResponse(
          input.interactionId,
          input.interactionToken,
          input.ephemeral,
        );
      }),
    sendReply: t.procedure
      .input(DiscordInteractionReplyUpdateSchema.extend({ ephemeral: z.boolean() }))
      .mutation(async ({ input }) => {
        return await interactionService.sendReply(
          input.interactionId,
          input.interactionToken,
          input.body,
          input.ephemeral,
        );
      }),
    getGuildChannels: t.procedure
      .input(
        z.object({
          guildId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return await channelsService.getGuildChannels(input.guildId);
      }),
    getGuildRoles: t.procedure
      .input(
        z.object({
          guildId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return await rolesService.getGuildRoles(input.guildId);
      }),
  });
}

export type DiscordRestRouter = ReturnType<typeof createDiscordRestRouter>;
