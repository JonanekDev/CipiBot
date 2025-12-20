import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { LevelingService } from './service';
import { GuildMessage } from '@cipibot/schemas/dist/discord';
import { getGuildConfig } from '@cipibot/config-client';

const CONSUMER_GROUP = 'leveling-service-group';

export async function registerConsumers(levelingService: LevelingService) {
  await registerTopicHandler<GuildMessage>(
    CONSUMER_GROUP,
    'discord.message.create',
    levelingService.handleMessage.bind(levelingService),
  );

  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  console.log(`Disconnecting Kafka consumer group: ${CONSUMER_GROUP}`);
  await disconnectConsumers(CONSUMER_GROUP);
}
