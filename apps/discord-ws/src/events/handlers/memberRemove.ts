import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';
import { GuildMemberRemovePayloadType } from '@cipibot/schemas/discord';

export async function handleMemberRemove(kafka: KafkaClient, member: GuildMemberRemovePayloadType) {
  await kafka.sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_REMOVE, member, {
    key: member.guild_id,
  });
}
