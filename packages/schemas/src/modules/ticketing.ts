import z from 'zod';
import { EmbedSchema } from '../discord/embeds';
import { BaseModuleSchema } from './base';

export const TicketingConfigSchema = BaseModuleSchema.extend({
  enabled: z.boolean().default(false),
  ticketCategoryId: z.string().nullable().default(null),
  ticketChannelId: z.string().nullable().default(null),
  ticketMessageId: z.string().nullable().default(null),
  ticketMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
});

export type TicketingConfig = z.infer<typeof TicketingConfigSchema>;
