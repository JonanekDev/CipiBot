import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';
import {
  GuildUpdatePayload,
  GuildUpdateSchema,
  GuildDeletePayload,
  GuildDeleteSchema,
} from '@cipibot/schemas/discord';
import {
  GatewayGuildCreateDispatchData,
  GatewayGuildUpdateDispatchData,
  GatewayGuildDeleteDispatchData,
} from 'discord-api-types/gateway/v10';

export async function handleGuildEvent(
  kafka: KafkaClient,
  topic: string,
  data: GatewayGuildCreateDispatchData | GatewayGuildUpdateDispatchData,
) {
  const payload: GuildUpdatePayload = GuildUpdateSchema.parse({
    id: data.id,
    name: data.name,
    icon: data.icon,
    owner_id: data.owner_id,
    preferred_locale: data.preferred_locale,
  });

  await kafka.sendEvent(topic, payload, { key: payload.id });
}

export async function handleGuildDelete(kafka: KafkaClient, data: GatewayGuildDeleteDispatchData) {
  const payload: GuildDeletePayload = GuildDeleteSchema.parse({
    id: data.id,
  });

  await kafka.sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_DELETE, payload, { key: payload.id });
}
