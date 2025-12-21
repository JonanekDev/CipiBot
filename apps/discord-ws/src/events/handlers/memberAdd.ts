import { GatewayGuildMemberAddDispatchData } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';

export async function handleMemberAdd(member: GatewayGuildMemberAddDispatchData) {
  await sendEvent('discord.guild.member.add', member, { key: member.guild_id });
}
