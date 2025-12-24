import { GatewayGuildMemberRemoveDispatchData } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants';

export async function handleMemberRemove(member: GatewayGuildMemberRemoveDispatchData) {
  await sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_REMOVE, member, {
    key: member.guild_id,
  });
}
