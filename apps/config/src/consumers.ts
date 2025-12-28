import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { ConfigService } from './service';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { GuildUpdatePayload, GuildUpdateSchema } from '@cipibot/schemas/discord';

const CONSUMER_GROUP = 'config-service-group';

export async function registerConsumers(configService: ConfigService) {
  await registerTopicHandler<GuildUpdatePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_UPDATE,
    GuildUpdateSchema,
    configService.upsertGuild.bind(configService),
  );

  await registerTopicHandler<GuildUpdatePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_CREATE,
    GuildUpdateSchema,
    configService.upsertGuild.bind(configService),
  );

  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  console.log(`Disconnecting Kafka consumer group: ${CONSUMER_GROUP}`);
  await disconnectConsumers(CONSUMER_GROUP);
}
