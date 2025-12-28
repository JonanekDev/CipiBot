import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { LevelingService } from './service';
import { CommandInteraction, CommandInteractionSchema, GuildMemberPayloadSchema, GuildMemberPayloadType, GuildMemberRemovePayloadSchema, GuildMemberRemovePayloadType, MessageSchema, MessageType } from '@cipibot/schemas/discord';
import { getServiceCommandTopic } from '@cipibot/commands';
import { Command } from '@cipibot/commands';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { getGuildConfig } from '@cipibot/config-client';

const CONSUMER_GROUP = 'leveling-service-group';

export async function registerConsumers(
  levelingService: LevelingService,
  commands: Map<string, Command>,
) {
  await registerTopicHandler<MessageType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.MESSAGE_CREATE,
    MessageSchema,
    async (message) => {
      if (message.author.bot) return;
      const guildId = message.guild_id;
      if (!guildId) return;
      getGuildConfig(guildId).then((config) => {
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

  await registerTopicHandler<GuildMemberPayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_ADD,
    GuildMemberPayloadSchema,
    async (data) => {
      await levelingService.syncMemberPresence(data.guild_id, data.user.id, false);
    },
  );

  await registerTopicHandler<GuildMemberRemovePayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_REMOVE,
    GuildMemberRemovePayloadSchema,
    async (data) => {
      await levelingService.syncMemberPresence(data.guild_id, data.user.id, true);
    },
  );

  await registerTopicHandler<CommandInteraction>(
    CONSUMER_GROUP,
    getServiceCommandTopic('leveling'),
    CommandInteractionSchema,
    async (interaction) => {
      const commandName = interaction.data.name;
      const command = commands.get(commandName);

      if (command) {
        try {
          console.log(`Executing command: ${commandName}`);
          await command.handler(interaction);
        } catch (error) {
          console.error(`Error executing command ${commandName}:`, error);
          // TODO: Send error response to user
        }
      } else {
        console.warn(`Received command '${commandName}' but no handler found.`);
      }
    },
  );

  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  console.log(`Disconnecting Kafka consumer group: ${CONSUMER_GROUP}`);
  await disconnectConsumers(CONSUMER_GROUP);
}
