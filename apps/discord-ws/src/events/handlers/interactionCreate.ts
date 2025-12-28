import { getCommandRoute, getServiceCommandTopic } from '@cipibot/commands';
import { getGuildConfig } from '@cipibot/config-client';
import { DiscordRestRouter } from '@cipibot/discord-rest/router';
import { sendEvent } from '@cipibot/kafka';
import { TRPCClient } from '@trpc/client';
import { Interaction, isCommandInteraction } from '@cipibot/schemas/discord';
import { COMMAND_META } from '@cipibot/commands/commandsMeta';
import { DiscordInteractionReplyUpdateType } from '@cipibot/schemas';
import { createErrorEmbed } from '@cipibot/embeds';

export async function handleInteractionCreate(
  interaction: Interaction,
  trpc: TRPCClient<DiscordRestRouter>,
) {
  if (isCommandInteraction(interaction)) {
    const serviceName = await getCommandRoute(interaction.data.name);
    const guildConfig = await getGuildConfig(interaction.guild_id!);
    if (serviceName) {
      const meta = COMMAND_META[interaction.data.name];
      let ephemeral = false;
      if (!meta) {
        console.warn(
          `No command meta found for command: ${interaction.data.name} - Create meta in @cipibot/commands/commandsMeta.ts`,
        );
      } else {
        const moduleConfig = guildConfig[meta.module];
        const commandConfig = meta.get(guildConfig);
        if (!moduleConfig.enabled || !commandConfig.enabled) {
          const eventData: DiscordInteractionReplyUpdateType = {
            interactionId: interaction.id,
            interactionToken: interaction.token,
            body: {
              embeds: [
                !moduleConfig.enabled
                  ? createErrorEmbed(
                      'MODULE_DISABLED',
                      { module: serviceName },
                      guildConfig.language,
                    )
                  : createErrorEmbed(
                      'COMMAND_DISABLED',
                      { command: interaction.data.name },
                      guildConfig.language,
                    ),
              ],
            },
          };

          trpc.sendReply
            .mutate({
              interactionId: interaction.id,
              interactionToken: interaction.token,
              body: eventData.body,
              ephemeral: true,
            })
            .catch((error) => {
              console.error('Failed to send error reply:', error);
            });
          return;
        }
        ephemeral = commandConfig.ephemeral;
      }
      await trpc.sendDeferCommandResponse
        .mutate({
          interactionId: interaction.id,
          interactionToken: interaction.token,
          ephemeral: ephemeral,
        })
        .catch((error) => {
          console.error('Failed to defer interaction:', error);
        });
      await sendEvent(getServiceCommandTopic(serviceName), interaction, {
        key: interaction.guild_id,
      });
    } else {
      //TODO: Custom commands
      console.warn(`No service route found for command: ${interaction.data.name}`);
      await trpc.sendReply
        .mutate({
          interactionId: interaction.id,
          interactionToken: interaction.token,
          body: {
            embeds: [
              createErrorEmbed(
                'COMMAND_UNAVAILABLE',
                { command: interaction.data.name },
                guildConfig.language,
              ),
            ],
          },
          ephemeral: true,
        })
        .catch((error) => {
          console.error('Failed to send error reply:', error);
        });
    }
  }
}
