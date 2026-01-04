import { CommandInteraction, User } from '@cipibot/schemas/discord';
import {
  APIApplicationCommandInteractionDataUserOption,
  ApplicationCommandOptionType,
} from 'discord-api-types/v10';

export function getUserOption(
  interaction: CommandInteraction,
  optionName: string,
): { userId: string; user: User | null } | null {
  const options = interaction.data.options;
  if (!options) return null;

  const userOption = options.find(
    (o): o is APIApplicationCommandInteractionDataUserOption =>
      o.name === optionName && o.type === ApplicationCommandOptionType.User,
  );

  if (!userOption) return null;

  const user = interaction.data.resolved?.users?.[userOption.value] ?? null;

  return {
    userId: userOption.value,
    user,
  };
}
