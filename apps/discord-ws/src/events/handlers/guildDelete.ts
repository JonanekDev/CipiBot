import { GatewayGuildDeleteDispatchData } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';

export async function handleGuildDelete(guild: GatewayGuildDeleteDispatchData) {
  await sendEvent('discord.guild.delete', guild, { key: guild.id });
}
