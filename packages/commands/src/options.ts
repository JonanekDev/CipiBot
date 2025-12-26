import { APIApplicationCommandInteractionDataUserOption, APIChatInputApplicationCommandInteraction, APIUser, ApplicationCommandOptionType } from "discord-api-types/v10";

export function getUserOption(
  interaction: APIChatInputApplicationCommandInteraction,
  optionName: string,
): { userId: string; user: APIUser | null } | null {
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