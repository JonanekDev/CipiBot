import { GatewayDispatchEvents, GatewayDispatchPayload } from 'discord-api-types/gateway/v10';
import { handleMessageCreate } from './handlers/messageCreate';
import { handleGuildEvent } from './handlers/guild';
import { handleMemberAdd } from './handlers/memberAdd';
import { handleMemberRemove } from './handlers/memberRemove';
import { handleGuildDelete } from './handlers/guildDelete';
import { handleInteractionCreate } from './handlers/interactionCreate';
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

      default:
        logger.warn({ eventType: event.t },`Unhandled event type`);
        break;
    }
  } catch (error) {
    logger.error({ eventType: event.t, error }, `Error processing event`);
  }
}
