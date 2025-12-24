import { getCommandRoute, getServiceCommandTopic } from '@cipibot/commands';
import { DiscordRestRouter } from '@cipibot/discord-rest/router';
import { sendEvent } from '@cipibot/kafka';
import { TRPCClient } from '@trpc/client';
import { APIInteraction, InteractionType } from 'discord-api-types/v10';

export async function handleInteractionCreate(
  interaction: APIInteraction,
  trpc: TRPCClient<DiscordRestRouter>,
) {
  if (interaction.type == InteractionType.ApplicationCommand) {
    const serviceName = await getCommandRoute(interaction.data.name);
    if (serviceName) {
      trpc.sendDeferCommandResponse
        .mutate({
          interactionId: interaction.id,
          interactionToken: interaction.token,
        })
        .catch((error) => {
          console.error('Failed to defer interaction:', error);
        });
      await sendEvent(getServiceCommandTopic(serviceName), interaction, {
        key: interaction.guild_id,
      });
    } else {
      console.warn(`No service route found for command: ${interaction.data.name}`);
      //TODO: Respond with an error message to the interaction
    }
  }
}
