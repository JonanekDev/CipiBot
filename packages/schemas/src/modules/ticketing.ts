import z from 'zod';
import { EmbedSchema } from '../discord/embeds';
import { BaseModuleSchema } from './base';

export const TicketingConfigSchema = BaseModuleSchema.extend({
  enabled: z.boolean().default(false),
  ticketCategoryId: z.string().nullable().default(null),
  ticketChannelId: z.string().nullable().default(null),
  ticketMessageId: z.string().nullable().default(null),
  newTicketMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
  ticketCreatedMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
  ticketClosedMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
  ticketClosedDMMessage: z.union([z.string(), EmbedSchema]).nullable().default(null),
  deleteChannelAfterCloseHours: z.number().min(0).default(168), // 7 days
  enableTranscripts: z.boolean().default(true),
  deleteTranscriptAfterDays: z.number().min(1).default(30),
});

export type TicketingConfig = z.infer<typeof TicketingConfigSchema>;
