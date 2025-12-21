import { GatewayGuildMemberRemoveDispatchData } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';

export async function handleMemberRemove(member: GatewayGuildMemberRemoveDispatchData) {
  await sendEvent('discord.guild.member.remove', member, { key: member.guild_id });
}
