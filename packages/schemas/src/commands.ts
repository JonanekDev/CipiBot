import z from "zod";
import { EmbedSchemna } from "./discord";

export const CommandSchema = z.object({
      ephemeral: z.boolean().default(false),
      customEmbed: z.union([z.string(), EmbedSchemna]).nullable().default(null),
    })

export type CommandType = z.infer<typeof CommandSchema>;