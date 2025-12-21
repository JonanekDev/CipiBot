import { APIGuild } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';

export async function handleGuildEvent(topic: string, guild: APIGuild) {
  await sendEvent(topic, guild, { key: guild.id });
}
