import { sendEvent } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { GuildDeletePayload } from '@cipibot/schemas/discord';

export async function handleGuildDelete(guild: GuildDeletePayload) {
  await sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_DELETE, guild, { key: guild.id });
}
