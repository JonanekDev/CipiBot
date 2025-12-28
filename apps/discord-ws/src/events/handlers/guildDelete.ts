import { KafkaClient } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { GuildDeletePayload } from '@cipibot/schemas/discord';

export async function handleGuildDelete(kafka: KafkaClient, guild: GuildDeletePayload) {
  await kafka.sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_DELETE, guild, { key: guild.id });
}
