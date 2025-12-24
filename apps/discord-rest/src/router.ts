import { initTRPC } from '@trpc/server';
import { InteractionsService } from './services/interactions.service';
import z from 'zod';

const t = initTRPC.create();

export function createDiscordRestRouter(service: InteractionsService) {
  return t.router({
    sendDeferCommandResponse: t.procedure
      .input(z.object({ interactionId: z.string(), interactionToken: z.string() }))
      .mutation(async ({ input }) => {
        return await service.deferCommandResponse(input.interactionId, input.interactionToken);
      }),
  });
}

export type DiscordRestRouter = ReturnType<typeof createDiscordRestRouter>;
