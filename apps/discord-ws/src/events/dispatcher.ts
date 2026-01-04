import { GatewayDispatchEvents, GatewayDispatchPayload } from 'discord-api-types/gateway/v10';
import { handleMessageCreate } from './handlers/messageCreate';
import { handleGuildEvent, handleGuildDelete } from './handlers/guildEvents';
import { handleMemberAdd, handleMemberRemove } from './handlers/membersEvent';
import { handleInteractionCreate } from './handlers/interactionCreate';
import { handleChannelCreate, handleChannelUpdate, handleChannelDelete } from './handlers/channelEvents';
import { handleRoleCreate, handleRoleUpdate, handleRoleDelete } from './handlers/roleEvents';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { DiscordRestRouter } from '@cipibot/discord-rest/router';
import { TRPCClient } from '@trpc/client';
import { KafkaClient } from '@cipibot/kafka';
import { Logger } from '@cipibot/logger';
import { CommandRegistry } from '@cipibot/commands';
import { ConfigClient } from '@cipibot/config-client';

export async function dispatchEvent(
  event: GatewayDispatchPayload,
  trpc: TRPCClient<DiscordRestRouter>,
  kafka: KafkaClient,
  logger: Logger,
  commandRegistry: CommandRegistry,
  configClient: ConfigClient,
): Promise<void> {
  try {
    switch (event.t) {
      case GatewayDispatchEvents.MessageCreate:
        await handleMessageCreate(kafka, event.d);
        break;

      case GatewayDispatchEvents.GuildCreate:
        await handleGuildEvent(kafka, KAFKA_TOPICS.DISCORD_INBOUND.GUILD_CREATE, event.d);
        break;

      case GatewayDispatchEvents.GuildUpdate:
        await handleGuildEvent(kafka, KAFKA_TOPICS.DISCORD_INBOUND.GUILD_UPDATE, event.d);
        break;

      case GatewayDispatchEvents.GuildDelete:
        await handleGuildDelete(kafka, event.d);
        break;

      case GatewayDispatchEvents.GuildMemberAdd:
        await handleMemberAdd(kafka, event.d);
        break;

      case GatewayDispatchEvents.GuildMemberRemove:
        await handleMemberRemove(kafka, event.d);
        break;
      case GatewayDispatchEvents.InteractionCreate:
        await handleInteractionCreate(kafka, logger, event.d, trpc, commandRegistry, configClient);
        break;

      case GatewayDispatchEvents.ChannelCreate:
        await handleChannelCreate(kafka, event.d);
        break;

      case GatewayDispatchEvents.ChannelUpdate:
        await handleChannelUpdate(kafka, event.d);
        break;

      case GatewayDispatchEvents.ChannelDelete:
        await handleChannelDelete(kafka, event.d);
        break;

      case GatewayDispatchEvents.GuildRoleCreate:
        await handleRoleCreate(kafka, event.d);
        break;

      case GatewayDispatchEvents.GuildRoleUpdate:
        await handleRoleUpdate(kafka, event.d);
        break;

      case GatewayDispatchEvents.GuildRoleDelete:
        await handleRoleDelete(kafka, event.d);
        break;

      default:
        logger.warn({ eventType: event.t }, `Unhandled event type`);
        break;
    }
  } catch (error) {
    logger.error({ eventType: event.t, error }, `Error processing event`);
  }
}
