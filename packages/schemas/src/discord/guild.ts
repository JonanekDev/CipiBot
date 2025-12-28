import z from "zod";
import { GuildMemberSchema, UserSchema } from "./common";

const BaseGuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  owner_id: z.string(),
  preferred_locale: z.string(),
});

export const GuildUpdateSchema = BaseGuildSchema;

export type GuildUpdatePayload = z.infer<typeof GuildUpdateSchema>;

export const GuildDeleteSchema = z.object({
  id: z.string(),
});

export type GuildDeletePayload = z.infer<typeof GuildDeleteSchema>;

export const GuildMemberPayloadSchema = GuildMemberSchema.extend({
  guild_id: z.string(),
});

export type GuildMemberPayloadType = z.infer<typeof GuildMemberPayloadSchema>;

export const GuildMemberRemovePayloadSchema = z.object({
  guild_id: z.string(),
  user: UserSchema,
});

export type GuildMemberRemovePayloadType = z.infer<typeof GuildMemberRemovePayloadSchema>;