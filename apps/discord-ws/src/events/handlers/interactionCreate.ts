import { getCommandRoute, getServiceCommandTopic } from '@cipibot/commands';
import { sendEvent } from '@cipibot/kafka';
import { APIInteraction, InteractionType } from 'discord-api-types/v10';

export async function handleInteractionCreate(interaction: APIInteraction) {
  if (interaction.type == InteractionType.ApplicationCommand) {
    const serviceName = await getCommandRoute(interaction.data.name);
    if (serviceName) {
      await sendEvent(getServiceCommandTopic(serviceName), interaction, {
        key: interaction.guild_id,
      });
    } else {
      console.warn(`No service route found for command: ${interaction.data.name}`);
      //TODO: Respond with an error message to the interaction
    }
  }
}
