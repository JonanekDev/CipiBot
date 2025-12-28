import { InteractionType } from 'discord-api-types/v10';
import z from 'zod';
import { GuildMemberSchema, MessageSchema, UserSchema } from './common';

export const BaseInteractionSchema = z.object({
  id: z.string(),
  application_id: z.string(),
  type: z.number().int(),
  guild_id: z.string().optional(),
  channel_id: z.string().optional(),
  member: GuildMemberSchema.optional(),
  user: UserSchema.optional(),
  token: z.string(),
  version: z.number().int(),
});

export const CommandInteractionDataSchema = z.object({
  type: z.number().int(),
  name: z.string(),
  id: z.string(),
  options: z
    .array(
      z.object({
        type: z.number().int(),
        name: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
        options: z.any().optional(),
      }),
    )
    .optional(),
    resolved: z.object({
      users: z.record(z.string(), UserSchema).optional(),
      members: z.record(z.string(), GuildMemberSchema).optional(),
    }).optional(),
  guild_id: z.string().optional(),
  target_id: z.string().optional(),
});

export type CommandInteractionData = z.infer<typeof CommandInteractionDataSchema>;

export const MessageComponentInteractionDataSchema = z.object({
  custom_id: z.string(),
  message: MessageSchema.optional(),
  component_type: z.number().int(),
  values: z.array(z.string()).optional(),
});

export type MessageComponentInteractionData = z.infer<typeof MessageComponentInteractionDataSchema>;

export const CommandInteractionSchema = BaseInteractionSchema.extend({
  type: z.literal(InteractionType.ApplicationCommand),
  data: CommandInteractionDataSchema,
});

export type CommandInteraction = z.infer<typeof CommandInteractionSchema>;

export const MessageComponentInteractionSchema = BaseInteractionSchema.extend({
  type: z.literal(InteractionType.MessageComponent),
  data: MessageComponentInteractionDataSchema,
});

export type MessageComponentInteraction = z.infer<typeof MessageComponentInteractionSchema>;

export const PingInteractionSchema = BaseInteractionSchema.extend({
  type: z.literal(InteractionType.Ping),
});

export type PingInteraction = z.infer<typeof PingInteractionSchema>;

export const CommandAutocompleteInteractionSchema = BaseInteractionSchema.extend({
    type: z.literal(InteractionType.ApplicationCommandAutocomplete),
    //TODO
})

export type CommandAutocompleteInteraction = z.infer<typeof CommandAutocompleteInteractionSchema>;

export const ModalSubmitInteractionSchema = BaseInteractionSchema.extend({
    type: z.literal(InteractionType.ModalSubmit),
    //TODO
})

export type ModalSubmitInteraction = z.infer<typeof ModalSubmitInteractionSchema>;

export const InteractionSchema = z.discriminatedUnion('type', [
    CommandInteractionSchema,
    MessageComponentInteractionSchema,
    PingInteractionSchema,
    CommandAutocompleteInteractionSchema,
    ModalSubmitInteractionSchema,
]);

export type Interaction = z.infer<typeof InteractionSchema>;

export function isCommandInteraction(
  interaction: Interaction,
): interaction is CommandInteraction {
  return interaction.type === InteractionType.ApplicationCommand;
}

export function isMessageComponentInteraction(
  interaction: Interaction,
): interaction is z.infer<typeof MessageComponentInteractionSchema> {
  return interaction.type === InteractionType.MessageComponent;
}

