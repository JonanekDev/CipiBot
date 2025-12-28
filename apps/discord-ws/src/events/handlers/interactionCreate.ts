import { CommandRegistry } from '@cipibot/commands';
import { ConfigClient } from '@cipibot/config-client';
import { DiscordRestRouter } from '@cipibot/discord-rest/router';
import { TRPCClient } from '@trpc/client';
import { Interaction, isCommandInteraction } from '@cipibot/schemas/discord';
import { COMMAND_META } from '@cipibot/commands/commandsMeta';
import { DiscordInteractionReplyUpdateType } from '@cipibot/schemas';
import { createErrorEmbed } from '@cipibot/embeds';
import { KafkaClient } from '@cipibot/kafka';
import { Logger } from '@cipibot/logger';

export async function handleInteractionCreate(
  kafka: KafkaClient,
  logger: Logger,
  interaction: Interaction,
  trpc: TRPCClient<DiscordRestRouter>,
  commandRegistry: CommandRegistry,
  configClient: ConfigClient,
) {
  if (isCommandInteraction(interaction)) {
    const serviceName = await commandRegistry.getCommandRoute(interaction.data.name);
    if (!interaction.guild_id) return; // Only handle guild interactions for now
    const guildConfig = await configClient.getGuildConfig(interaction.guild_id);
    if (serviceName) {
      const meta = COMMAND_META[interaction.data.name];
      let ephemeral = false;
      if (!meta) {
        logger.warn(
          { interactionName: interaction.data.name },
          `No command meta found for command - Create meta in @cipibot/commands/commandsMeta.ts`,
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
              logger.error({ error, interactionName: interaction.data.name }, 'Failed to send disabled reply');
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
          logger.error({ error, interactionName: interaction.data.name }, 'Failed to send defer reply');
        });
      await kafka.sendEvent(commandRegistry.getServiceCommandTopic(serviceName), interaction, {
        key: interaction.guild_id,
      });
    } else {
      //TODO: Custom commands
      logger.error(`No service route found for command: ${interaction.data.name}`);
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
          logger.error({ error, interactionName: interaction.data.name }, 'Failed to send error reply');
        });
    }
  }
}
