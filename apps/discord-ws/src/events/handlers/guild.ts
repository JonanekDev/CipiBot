import { KafkaClient } from '@cipibot/kafka';
import { GuildUpdatePayload } from '@cipibot/schemas/discord';

export async function handleGuildEvent(kafka: KafkaClient, topic: string, guild: GuildUpdatePayload) {
  await kafka.sendEvent(topic, guild, { key: guild.id });
}
