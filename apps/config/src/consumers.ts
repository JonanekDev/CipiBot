import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { ConfigService } from './service';
import { APIGuild } from 'discord-api-types/v10';
import { KAFKA_TOPICS } from '@cipibot/constants';

const CONSUMER_GROUP = 'config-service-group';

export async function registerConsumers(configService: ConfigService) {
  await registerTopicHandler<APIGuild>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_UPDATE,
    configService.upsertGuild.bind(configService),
  );

  await registerTopicHandler<APIGuild>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_CREATE,
    configService.upsertGuild.bind(configService),
  );

  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  console.log(`Disconnecting Kafka consumer group: ${CONSUMER_GROUP}`);
  await disconnectConsumers(CONSUMER_GROUP);
}
