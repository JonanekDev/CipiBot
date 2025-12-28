import { sendEvent } from '@cipibot/kafka';
import { GuildUpdatePayload } from '@cipibot/schemas/discord';

export async function handleGuildEvent(topic: string, guild: GuildUpdatePayload) {
  await sendEvent(topic, guild, { key: guild.id });
}
