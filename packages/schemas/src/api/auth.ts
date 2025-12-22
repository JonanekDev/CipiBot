import z from "zod";

export const DashboardGuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  isKnown: z.boolean(), 
});

export type DashboardGuild = z.infer<typeof DashboardGuildSchema>;

export const LoginReqSchema = z.object({
    code: z.string().min(2),
}) 

export type LoginReqType = z.infer<typeof LoginReqSchema>;

export const SessionDataSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    global_name: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
  guilds: z.array(DashboardGuildSchema), // Array of guilds the user is in
});

export type SessionDataType = z.infer<typeof SessionDataSchema>;

export const LoginResSchema = z.object({
  status: z.literal('ok'),
  data: SessionDataSchema,
});

export type LoginResType = z.infer<typeof LoginResSchema>;

export const MeResSchema = z.object({
  status: z.literal('ok'),
  data: SessionDataSchema,
});

export type MeResType = z.infer<typeof MeResSchema>;