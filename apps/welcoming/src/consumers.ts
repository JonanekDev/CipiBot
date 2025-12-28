import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { WelcomingService } from './service';
import { KAFKA_TOPICS } from '@cipibot/constants';
import {
  GuildMemberPayloadSchema,
  GuildMemberPayloadType,
  GuildMemberRemovePayloadSchema,
  GuildMemberRemovePayloadType,
} from '@cipibot/schemas/discord';

const CONSUMER_GROUP = 'welcoming-service-group';

export async function registerConsumers(welcomingService: WelcomingService) {
  await registerTopicHandler<GuildMemberPayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_ADD,
    GuildMemberPayloadSchema,
    async (payload) => {
      await welcomingService.welcomeMessage(
        payload.guild_id,
        payload.user.id,
        payload.user.username,
        payload.user.avatar,
        payload.user.global_name,
      );
    },
  );

  await registerTopicHandler<GuildMemberRemovePayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_REMOVE,
    GuildMemberRemovePayloadSchema,
    async (payload) => {
      await welcomingService.leaveMessage(
        payload.guild_id,
        payload.user.id,
        payload.user.username,
        payload.user.avatar,
        payload.user.global_name,
      );
    },
  );

  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  await disconnectConsumers(CONSUMER_GROUP);
}
