import { KafkaClient } from '@cipibot/kafka';
import { LevelingService } from './service';
import {
  CommandInteraction,
  CommandInteractionSchema,
  GuildMemberPayloadSchema,
  GuildMemberPayload,
  GuildMemberRemovePayloadSchema,
  GuildMemberRemovePayload,
  MessageSchema,
  Message,
} from '@cipibot/schemas/discord';
import { Command, CommandRegistry } from '@cipibot/commands';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { ConfigClient } from '@cipibot/config-client';
import { Logger } from '@cipibot/logger';

const CONSUMER_GROUP = 'leveling-service-group';

export async function registerConsumers(
  kafka: KafkaClient,
  commandRegistry: CommandRegistry,
  levelingService: LevelingService,
  configClient: ConfigClient,
  logger: Logger,
  commands: Map<string, Command>,
) {
  await kafka.registerHandler<Message>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.MESSAGE_CREATE,
    MessageSchema,
    async (message) => {
      if (message.author.bot) return;
      const guildId = message.guild_id;
      if (!guildId) return;
      configClient.getGuildConfig(guildId).then((config) => {
        const levelingConfig = config.leveling;
        if (!levelingConfig.enabled) return;
        if (levelingConfig.ignoreChannelIds.includes(message.channel_id)) return;
        levelingService.processMessage(
          guildId,
          config,
          message.author,
          message.content,
          message.channel_id,
        );
      });
    },
  );

  await kafka.registerHandler<GuildMemberPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_ADD,
    GuildMemberPayloadSchema,
    async (data) => {
      await levelingService.syncMemberPresence(data.guild_id, data.user.id, false);
    },
  );

  await kafka.registerHandler<GuildMemberRemovePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_REMOVE,
    GuildMemberRemovePayloadSchema,
    async (data) => {
      await levelingService.syncMemberPresence(data.guild_id, data.user.id, true);
    },
  );

  await kafka.registerHandler<CommandInteraction>(
    CONSUMER_GROUP,
    commandRegistry.getServiceCommandTopic(),
    CommandInteractionSchema,
    async (interaction) => {
      const commandName = interaction.data.name;
      const command = commands.get(commandName);

      if (command) {
        try {
          logger.info(
            { commandName, guildId: interaction.guild_id },
            `Executing command: ${commandName}`,
          );
          await command.handler(interaction);
        } catch (error) {
          logger.error(
            { commandName, error, guildId: interaction.guild_id },
            `Error executing command: ${commandName}`,
          );
          // TODO: Send error response to user
        }
      } else {
        logger.warn(
          { commandName, guildId: interaction.guild_id },
          `Received command '${commandName}' but no handler found.`,
        );
      }
    },
  );

  await kafka.startConsumer(CONSUMER_GROUP);
}
