import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { DiscordRestService } from './service';
import {
  DiscordInteractionReplyUpdateSchema,
  DiscordInteractionReplyUpdateType,
  DiscordMessagePayloadSchema,
  DiscordMessagePayloadType,
  RolePayloadSchema,
  RolePayloadType,
  UpdateCommandPayloadSchema,
  UpdateCommandPayloadType,
} from '@cipibot/schemas';
import { CommandsService } from './services/commands.service';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { InteractionsService } from './services/interactions.service';

const CONSUMER_GROUP = 'discord-rest-service-group';

export async function registerConsumers(
  discordRestService: DiscordRestService,
  commandsService: CommandsService,
  interactionsService: InteractionsService,
) {
  await registerTopicHandler<DiscordMessagePayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_MESSAGE,
    DiscordMessagePayloadSchema,
    async (payload) => {
      await discordRestService.handleMessageCreate(payload);
    },
  );

  await registerTopicHandler<RolePayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.MEMBER_ROLE_ADD,
    RolePayloadSchema,
    async (payload) => {
      await discordRestService.handleMemberRoleAdd(payload);
    },
  );

  await registerTopicHandler<UpdateCommandPayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.SYSTEM.COMMANDS_UPDATE,
    UpdateCommandPayloadSchema,
    async (payload) => {
      commandsService.triggerSync();
    },
  );

  await registerTopicHandler<DiscordInteractionReplyUpdateType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.INTERACTION_REPLY_UPDATE,
    DiscordInteractionReplyUpdateSchema,
    async (payload) => {
      await interactionsService.updateReply(
        payload.interactionId,
        payload.interactionToken,
        payload.body,
      );
    },
  );

  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  console.log(`Disconnecting Kafka consumer group: ${CONSUMER_GROUP}`);
  await disconnectConsumers(CONSUMER_GROUP);
}
