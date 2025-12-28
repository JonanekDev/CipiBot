import { sendEvent } from '@cipibot/kafka';
import { MessageType } from '@cipibot/schemas/discord';
import { KAFKA_TOPICS } from '@cipibot/constants';

export async function handleMessageCreate(data: MessageType) {
  const key = data.guild_id || data.author.id;

  await sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.MESSAGE_CREATE, data, { key });
}
