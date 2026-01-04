import type { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import z from 'zod';

export const RolePayloadSchema = z.object({
  guildId: z.string(),
  userId: z.string(),
  roleId: z.string(),
});

export type RolePayload = z.infer<typeof RolePayloadSchema>;

export const DiscordMessagePayloadSchema = z.object({
  channelId: z.string(),
  body: z.custom<RESTPostAPIChannelMessageJSONBody>(),
});

export type DiscordMessagePayload = z.infer<typeof DiscordMessagePayloadSchema>;

export const DiscordDMPayloadSchema = z.object({
  userId: z.string(),
  body: z.custom<RESTPostAPIChannelMessageJSONBody>(),
});

export type DiscordDMPayload = z.infer<typeof DiscordDMPayloadSchema>;

export const DiscordInteractionReplyUpdateSchema = z.object({
  interactionId: z.string(),
  interactionToken: z.string(),
  body: z.custom<RESTPostAPIChannelMessageJSONBody>(),
});

export type DiscordInteractionReplyUpdate = z.infer<typeof DiscordInteractionReplyUpdateSchema>;

export const UpdateCommandPayloadSchema = z
  .object({
    serviceName: z.string(),
  })
  .strict();
export type UpdateCommandPayload = z.infer<typeof UpdateCommandPayloadSchema>;
