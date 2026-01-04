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

const CONSUMER_GROUP = 'discord-rest-service-group';

export async function registerConsumers(
  kafka: KafkaClient,
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
      await messagesService.sendMessage(payload.channelId, payload.body);
    },
  );

  await kafka.registerHandler<DiscordDMPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_DM,
    DiscordDMPayloadSchema,
    async (payload) => {
      await messagesService.sendDirectMessage(payload.userId, payload.body);
    },
  );

  await kafka.registerHandler<RolePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.MEMBER_ROLE_ADD,
    RolePayloadSchema,
    async (payload) => {
      await rolesService.addRoleToMember(payload.guildId, payload.userId, payload.roleId);
    },
  );

  await kafka.registerHandler<RolePayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_OUTBOUND.MEMBER_ROLE_REMOVE,
    RolePayloadSchema,
    async (payload) => {
      await rolesService.removeRoleFromMember(payload.guildId, payload.userId, payload.roleId);
    },
  );

  await kafka.registerHandler<UpdateCommandPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.SYSTEM.COMMANDS_UPDATE,
    UpdateCommandPayloadSchema,
    async (payload) => {
      commandsService.triggerSync(payload.serviceName);
    },
  );

  await kafka.registerHandler<DiscordInteractionReplyUpdate>(
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

  await kafka.registerHandler<ChannelEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_CREATE,
    ChannelEventPayloadSchema,
    async (payload) => {
      await channelsService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<ChannelEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_UPDATE,
    ChannelEventPayloadSchema,
    async (payload) => {
      await channelsService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<ChannelEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_DELETE,
    ChannelEventPayloadSchema,
    async (payload) => {
      await channelsService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<RoleEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_CREATE,
    RoleEventPayloadSchema,
    async (payload) => {
      await rolesService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<RoleEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_UPDATE,
    RoleEventPayloadSchema,
    async (payload) => {
      await rolesService.invalidateCache(payload.guildId);
    },
  );

  await kafka.registerHandler<RoleEventPayload>(
    CONSUMER_GROUP,
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_DELETE,
    RoleEventPayloadSchema,
    async (payload) => {
      await rolesService.invalidateCache(payload.guildId);
    },
  );

  await kafka.startConsumer(CONSUMER_GROUP);
}
