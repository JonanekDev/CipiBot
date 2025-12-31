import { ConfigService } from './service';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';
import { GuildDeletePayload, GuildDeleteSchema, GuildUpdatePayload, GuildUpdateSchema } from '@cipibot/schemas/discord';

const CONSUMER_GROUP = 'config-service-group';

export async function registerConsumers(configService: ConfigService, kafka: KafkaClient) {
  await kafka.registerHandler<GuildUpdatePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_UPDATE,
    GuildUpdateSchema,
    async (payload) => {
      await configService.upsertGuild(payload);
    },
  );

  await kafka.registerHandler<GuildUpdatePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_CREATE,
    GuildUpdateSchema,
    async (payload) => {
      await configService.upsertGuild(payload);
    },
  );

  await kafka.registerHandler<GuildDeletePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_DELETE,
    GuildDeleteSchema,
    async (payload) => {
      await configService.removeGuild(payload.id);
    },
  );

  await kafka.startConsumer(CONSUMER_GROUP);
}
