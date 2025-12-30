import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';
import { GuildMemberPayloadType } from '@cipibot/schemas/discord';

export async function handleMemberAdd(kafka: KafkaClient, member: GuildMemberPayloadType) {
  await kafka.sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_ADD, member, {
    key: member.guild_id,
  });
}
