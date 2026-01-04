import { Message, MessageSchema } from '@cipibot/schemas/discord';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';
import { GatewayMessageCreateDispatchData } from 'discord-api-types/gateway/v10';

export async function handleMessageCreate(
  kafka: KafkaClient,
  data: GatewayMessageCreateDispatchData,
) {
  const payload: Message = MessageSchema.parse({
    id: data.id,
    channel_id: data.channel_id,
    guild_id: data.guild_id,
    content: data.content,
    author: {
      id: data.author.id,
      username: data.author.username,
      avatar: data.author.avatar,
      global_name: data.author.global_name ?? null,
      bot: data.author.bot,
    },
  });

  const key = payload.guild_id || payload.author.id;

  await kafka.sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.MESSAGE_CREATE, payload, { key });
}
