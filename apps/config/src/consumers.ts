import { ConfigService } from './service';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';
import { GuildUpdatePayload, GuildUpdateSchema } from '@cipibot/schemas/discord';

const CONSUMER_GROUP = 'config-service-group';

export async function registerConsumers(configService: ConfigService, kafka: KafkaClient) {
  await kafka.registerHandler<GuildUpdatePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_UPDATE,
    GuildUpdateSchema,
    configService.upsertGuild.bind(configService),
  );

  await kafka.registerHandler<GuildUpdatePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_CREATE,
    GuildUpdateSchema,
    configService.upsertGuild.bind(configService),
  );

  await kafka.startConsumer(CONSUMER_GROUP);
}
