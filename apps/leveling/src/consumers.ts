import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { LevelingService } from './service';
import { GuildMessage } from '@cipibot/schemas/dist/discord';
import {
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberRemoveDispatchData,
} from 'discord-api-types/gateway/v9';

const CONSUMER_GROUP = 'leveling-service-group';

export async function registerConsumers(levelingService: LevelingService) {
  await registerTopicHandler<GuildMessage>(
    CONSUMER_GROUP,
    'discord.message.create',
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
    'discord.guild.member.add',
    async (data) => {
      await levelingService.handleMemberAdd(data.guild_id, data.user.id);
    },
  );

  await registerTopicHandler<GatewayGuildMemberRemoveDispatchData>(
    CONSUMER_GROUP,
    'discord.guild.member.remove',
    async (data) => {
      await levelingService.handleMemberRemove(data.guild_id, data.user.id);
    },
  );
  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  console.log(`Disconnecting Kafka consumer group: ${CONSUMER_GROUP}`);
  await disconnectConsumers(CONSUMER_GROUP);
}
