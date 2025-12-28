import { GatewayGuildMemberAddDispatchData } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { GuildMemberPayloadType } from '@cipibot/schemas/discord';

export async function handleMemberAdd(member: GuildMemberPayloadType) {
  await sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_ADD, member, { key: member.guild_id });
}
