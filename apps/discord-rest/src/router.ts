import { initTRPC } from '@trpc/server';
import { InteractionsService } from './services/interactions.service';
import z from 'zod';
import { DiscordInteractionReplyUpdateSchema } from '@cipibot/schemas';

const t = initTRPC.create();

export function createDiscordRestRouter(service: InteractionsService) {
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
        return await service.deferCommandResponse(
          input.interactionId,
          input.interactionToken,
          input.ephemeral,
        );
      }),
    sendReply: t.procedure
      .input(DiscordInteractionReplyUpdateSchema.extend({ ephemeral: z.boolean() }))
      .mutation(async ({ input }) => {
        return await service.sendReply(
          input.interactionId,
          input.interactionToken,
          input.body,
          input.ephemeral,
        );
      }),
  });
}

export type DiscordRestRouter = ReturnType<typeof createDiscordRestRouter>;
