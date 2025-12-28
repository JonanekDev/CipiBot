import { MessageType } from '@cipibot/schemas/discord';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';

export async function handleMessageCreate(kafka: KafkaClient, data: MessageType) {
  const key = data.guild_id || data.author.id;

  await kafka.sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.MESSAGE_CREATE, data, { key });
}
