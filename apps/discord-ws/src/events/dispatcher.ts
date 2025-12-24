import { GatewayDispatchEvents, GatewayDispatchPayload } from 'discord-api-types/gateway/v10';
import { handleMessageCreate } from './handlers/messageCreate';
import { handleGuildEvent } from './handlers/guild';
import { handleMemberAdd } from './handlers/memberAdd';
import { handleMemberRemove } from './handlers/memberRemove';
import { handleGuildDelete } from './handlers/guildDelete';
import { handleInteractionCreate } from './handlers/interactionCreate';
import { KAFKA_TOPICS } from '@cipibot/constants';

export async function dispatchEvent(event: GatewayDispatchPayload) {
  try {
    switch (event.t) {
      case GatewayDispatchEvents.MessageCreate:
        await handleMessageCreate(event.d);
        break;

      case GatewayDispatchEvents.GuildCreate:
        await handleGuildEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_CREATE, event.d);
        break;

      case GatewayDispatchEvents.GuildUpdate:
        await handleGuildEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_UPDATE, event.d);
        break;

      case GatewayDispatchEvents.GuildDelete:
        await handleGuildDelete(event.d);
        break;

      case GatewayDispatchEvents.GuildMemberAdd:
        await handleMemberAdd(event.d);
        break;

      case GatewayDispatchEvents.GuildMemberRemove:
        await handleMemberRemove(event.d);
        break;
      case GatewayDispatchEvents.InteractionCreate:
        await handleInteractionCreate(event.d);
        break;

      default:
        console.warn(`Unhandled event type: ${event.t}`);
        break;
    }
  } catch (error) {
    console.error(`Error processing event ${event.t}:`, error);
  }
}
