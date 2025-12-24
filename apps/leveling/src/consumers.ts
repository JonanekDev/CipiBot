import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { LevelingService } from './service';
import { GuildMessage } from '@cipibot/schemas/dist/discord';
import { getServiceCommandTopic } from '@cipibot/commands';
import { Command } from '@cipibot/commands';
import {
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberRemoveDispatchData,
  APIInteraction,
  InteractionType,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';
import { KAFKA_TOPICS } from '@cipibot/constants';

const CONSUMER_GROUP = 'leveling-service-group';

export async function registerConsumers(
  levelingService: LevelingService,
  commands: Map<string, Command>,
) {
  await registerTopicHandler<GuildMessage>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.MESSAGE_CREATE,
    async (message) => {
      if (message.author.bot) return;
      await levelingService.handleMessage(
        message.author.id,
        message.content,
        message.channel_id,
        message.guild_id,
      );
    },
  );

  await registerTopicHandler<GatewayGuildMemberAddDispatchData>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_ADD,
    async (data) => {
      await levelingService.handleMemberAdd(data.guild_id, data.user.id);
    },
  );

  await registerTopicHandler<GatewayGuildMemberRemoveDispatchData>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_REMOVE,
    async (data) => {
      await levelingService.handleMemberRemove(data.guild_id, data.user.id);
    },
  );

  await registerTopicHandler<APIChatInputApplicationCommandInteraction>(
    CONSUMER_GROUP,
    getServiceCommandTopic('leveling'),
    async (interaction) => {
      if (interaction.type !== InteractionType.ApplicationCommand) return;

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
