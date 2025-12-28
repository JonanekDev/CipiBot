import type { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import z from 'zod';

export const RolePayloadSchema = z.object({
  guildId: z.string(),
  userId: z.string(),
  roleId: z.string(),
});

export type RolePayloadType = z.infer<typeof RolePayloadSchema>;

export const DiscordMessagePayloadSchema = z.object({
  channelId: z.string(),
  body: z.custom<RESTPostAPIChannelMessageJSONBody>(),
});

export type DiscordMessagePayloadType = z.infer<typeof DiscordMessagePayloadSchema>;

export const DiscordDMPayloadSchema = z.object({
  userId: z.string(),
  body: z.custom<RESTPostAPIChannelMessageJSONBody>(),
});

export type DiscordDMPayloadType = z.infer<typeof DiscordDMPayloadSchema>;

export const DiscordInteractionReplyUpdateSchema = z.object({
  interactionId: z.string(),
  interactionToken: z.string(),
  body: z.custom<RESTPostAPIChannelMessageJSONBody>(),
});

export type DiscordInteractionReplyUpdateType = z.infer<typeof DiscordInteractionReplyUpdateSchema>;

export const UpdateCommandPayloadSchema = z
  .object({
    serviceName: z.string(),
  })
  .strict();
export type UpdateCommandPayloadType = z.infer<typeof UpdateCommandPayloadSchema>;
