import { GatewayGuildMemberRemoveDispatchData } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { GuildMemberRemovePayloadType } from '@cipibot/schemas/discord';

export async function handleMemberRemove(member: GuildMemberRemovePayloadType) {
  await sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_REMOVE, member, {
    key: member.guild_id,
  });
}
