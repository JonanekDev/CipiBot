import { KafkaClient } from '@cipibot/kafka';
import {
  DiscordDMPayloadSchema,
  DiscordDMPayloadType,
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
import { MessagesService } from './services/messages.service';
import { RolesService } from './services/roles.service';

const CONSUMER_GROUP = 'discord-rest-service-group';

export async function registerConsumers(
  kafka: KafkaClient,
  commandsService: CommandsService,
  interactionsService: InteractionsService,
  messagesService: MessagesService,
  rolesService: RolesService,
) {
  await kafka.registerHandler<DiscordMessagePayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_MESSAGE,
    DiscordMessagePayloadSchema,
    async (payload) => {
      await messagesService.sendMessage(payload.channelId, payload.body);
    },
  );

  await kafka.registerHandler<DiscordDMPayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_DM,
    DiscordDMPayloadSchema,
    async (payload) => {
      await messagesService.sendDirectMessage(payload.userId, payload.body);
    },
  );

  await kafka.registerHandler<RolePayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.MEMBER_ROLE_ADD,
    RolePayloadSchema,
    async (payload) => {
      await rolesService.addRoleToMember(payload.guildId, payload.userId, payload.roleId);
    },
  );

  await kafka.registerHandler<RolePayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.MEMBER_ROLE_REMOVE,
    RolePayloadSchema,
    async (payload) => {
      await rolesService.removeRoleFromMember(payload.guildId, payload.userId, payload.roleId);
    },
  );

  await kafka.registerHandler<UpdateCommandPayloadType>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.SYSTEM.COMMANDS_UPDATE,
    UpdateCommandPayloadSchema,
    async (payload) => {
      commandsService.triggerSync(payload.serviceName);
    },
  );

  await kafka.registerHandler<DiscordInteractionReplyUpdateType>(
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

  await kafka.startConsumer(CONSUMER_GROUP);
}