import { GatewayGuildDeleteDispatchData } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants/dist/kafka';

export async function handleGuildDelete(guild: GatewayGuildDeleteDispatchData) {
  await sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_DELETE, guild, { key: guild.id });
}
