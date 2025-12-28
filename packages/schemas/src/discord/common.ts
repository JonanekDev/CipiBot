import z from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().nullable(),
  global_name: z.string().nullable(),
  bot: z.boolean().optional(),
});

export type UserType = z.infer<typeof UserSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  channel_id: z.string(),
  guild_id: z.string().optional(),
  content: z.string(),
  author: UserSchema,
});

export type MessageType = z.infer<typeof MessageSchema>;

export const GuildMemberSchema = z.object({
  user: UserSchema,
  roles: z.array(z.string()),
  joined_at: z.string().nullable(),
  flags: z.number().int(),
  permissions: z.string().optional(),
});

export type GuildMemberType = z.infer<typeof GuildMemberSchema>;
