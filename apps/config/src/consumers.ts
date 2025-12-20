import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { ConfigService } from './service';
import { APIGuild } from 'discord-api-types/v10';

const CONSUMER_GROUP = 'config-service-group';

export async function registerConsumers(configService: ConfigService) {
  await registerTopicHandler<APIGuild>(
    CONSUMER_GROUP,
    'discord.guild.update',
    configService.upsertGuild.bind(configService),
  );

  await registerTopicHandler<APIGuild>(
    CONSUMER_GROUP,
    'discord.guild.create',
    configService.upsertGuild.bind(configService),
  );

  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  console.log(`Disconnecting Kafka consumer group: ${CONSUMER_GROUP}`);
  await disconnectConsumers(CONSUMER_GROUP);
}
