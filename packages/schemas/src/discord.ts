import type { APIMessage, RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import z from 'zod';

export type GuildMessage = APIMessage & {
  guild_id?: string;
};
// Bcs we need schema for zod validation..
export const EmbedSchemna = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  author: z
    .object({
      name: z.string(),
      url: z.string().optional(),
      icon_url: z.string().optional(),
    })
    .optional(),
  color: z.number().int().optional(),
  url: z.string().optional(),
  fields: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        inline: z.boolean().optional(),
      }),
    )
    .optional(),
  footer: z
    .object({
      text: z.string(),
      icon_url: z.string().optional(),
    })
    .optional(),
  image: z
    .object({
      url: z.string(),
    })
    .optional(),
  thumbnail: z
    .object({
      url: z.string(),
    })
    .optional(),
});

export type EmbedType = z.infer<typeof EmbedSchemna>;

export const DiscordMessagePayloadSchema = z.object({
  channelId: z.string(),
  body: z.custom<RESTPostAPIChannelMessageJSONBody>(),
});

export type DiscordMessagePayloadType = z.infer<typeof DiscordMessagePayloadSchema>;

export const RolePayloadSchema = z.object({
  guildId: z.string(),
  userId: z.string(),
  roleId: z.string(),
});

export type RolePayloadType = z.infer<typeof RolePayloadSchema>;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().nullable(),
  global_name: z.string().nullable(),
});
