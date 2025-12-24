import { APIMessage } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import { GuildMessage } from '@cipibot/schemas';
import { KAFKA_TOPICS } from '@cipibot/constants';

export async function handleMessageCreate(data: APIMessage) {
  const message = data as GuildMessage;

  const key = message.guild_id || message.author.id;

  await sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.MESSAGE_CREATE, message, { key });
}
