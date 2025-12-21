import { APIMessage } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import { GuildMessage } from '@cipibot/schemas';

export async function handleMessageCreate(data: APIMessage) {
  const message = data as GuildMessage;

  const key = message.guild_id || message.author.id;

  await sendEvent('discord.message.create', message, { key });
}
