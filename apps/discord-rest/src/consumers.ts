import { KafkaClient } from '@cipibot/kafka';
import {
  DiscordDMPayloadSchema,
  DiscordDMPayload,
  DiscordInteractionReplyUpdateSchema,
  DiscordInteractionReplyUpdate,
  DiscordMessagePayloadSchema,
  DiscordMessagePayload,
  RolePayloadSchema,
  RolePayload,
  UpdateCommandPayloadSchema,
  UpdateCommandPayload,
} from '@cipibot/schemas';
import {
  ChannelEventPayloadSchema,
  ChannelEventPayload,
  RoleEventPayloadSchema,
  RoleEventPayload,
} from '@cipibot/schemas/discord';
import { CommandsService } from './services/commands.service';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { InteractionsService } from './services/interactions.service';
import { MessagesService } from './services/messages.service';
import { RolesService } from './services/roles.service';
import { ChannelsService } from './services/channels.service';
import { Logger } from '@cipibot/logger';
import { channel } from 'process';

const CONSUMER_GROUP = 'discord-rest-service-group';

export async function registerConsumers(
  kafka: KafkaClient,
  logger: Logger,
  commandsService: CommandsService,
  interactionsService: InteractionsService,
  messagesService: MessagesService,
  rolesService: RolesService,
  channelsService: ChannelsService,
) {
  await kafka.registerHandler<DiscordMessagePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_MESSAGE,
    DiscordMessagePayloadSchema,
    async (payload) => {
      logger.debug({ channelId: payload.channelId }, `Processing SEND_MESSAGE`);
      await messagesService.sendMessage(payload.channelId, payload.body);
    },
  );

  await kafka.registerHandler<DiscordDMPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_DM,
    DiscordDMPayloadSchema,
    async (payload) => {
      logger.debug({ userId: payload.userId }, `Processing SEND_DM`);
      await messagesService.sendDirectMessage(payload.userId, payload.body);
    },
  );

  await kafka.registerHandler<RolePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.MEMBER_ROLE_ADD,
    RolePayloadSchema,
    async (payload) => {
      logger.debug({ guildId: payload.guildId, userId: payload.userId, roleId: payload.roleId }, `Processing MEMBER_ROLE_ADD`);
      await rolesService.addRoleToMember(payload.guildId, payload.userId, payload.roleId);
    },
  );

  await kafka.registerHandler<RolePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.MEMBER_ROLE_REMOVE,
    RolePayloadSchema,
    async (payload) => {
      logger.debug({ guildId: payload.guildId, userId: payload.userId, roleId: payload.roleId }, `Processing MEMBER_ROLE_REMOVE`);
      await rolesService.removeRoleFromMember(payload.guildId, payload.userId, payload.roleId);
    },
  );

  await kafka.registerHandler<UpdateCommandPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.SYSTEM.COMMANDS_UPDATE,
    UpdateCommandPayloadSchema,
    async (payload) => {
      logger.debug({ serviceName: payload.serviceName }, `Processing COMMANDS_UPDATE`);
      commandsService.triggerSync(payload.serviceName);
    },
  );

  await kafka.registerHandler<DiscordInteractionReplyUpdate>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.INTERACTION_REPLY_UPDATE,
    DiscordInteractionReplyUpdateSchema,
    async (payload) => {
      logger.debug({ interactionId: payload.interactionId }, `Processing INTERACTION_REPLY_UPDATE`);
      await interactionsService.updateReply(
        payload.interactionId,
        payload.interactionToken,
        payload.body,
      );
    },
  );

  await kafka.registerHandler<ChannelEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_CREATE,
    ChannelEventPayloadSchema,
    async (payload) => {
      logger.debug({ guildId: payload.guildId }, `Processing CHANNEL_CREATE`);
      await channelsService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<ChannelEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_UPDATE,
    ChannelEventPayloadSchema,
    async (payload) => {
      logger.debug({ guildId: payload.guildId }, `Processing CHANNEL_UPDATE`);
      await channelsService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<ChannelEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_DELETE,
    ChannelEventPayloadSchema,
    async (payload) => {
      logger.debug({ guildId: payload.guildId }, `Processing CHANNEL_DELETE`);
      await channelsService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<RoleEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_CREATE,
    RoleEventPayloadSchema,
    async (payload) => {
      logger.debug({ guildId: payload.guildId }, `Processing GUILD_ROLE_CREATE`);
      await rolesService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<RoleEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_UPDATE,
    RoleEventPayloadSchema,
    async (payload) => {
      logger.debug({ guildId: payload.guildId }, `Processing GUILD_ROLE_UPDATE`);
      await rolesService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<RoleEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_DELETE,
    RoleEventPayloadSchema,
    async (payload) => {
      logger.debug({ guildId: payload.guildId }, `Processing GUILD_ROLE_DELETE`);
      await rolesService.invalidateCache(payload.guildId);
    },
  );

  await kafka.startConsumer(CONSUMER_GROUP);
}
