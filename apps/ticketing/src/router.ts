import { initTRPC } from '@trpc/server';
import { TicketingService } from './services/ticketing.service';
import { z } from '@cipibot/schemas';

const t = initTRPC.create();

export function createTicketingRouter(service: TicketingService) {
  return t.router({});
}

export type TicketingRouter = ReturnType<typeof createTicketingRouter>;
