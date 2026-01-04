import {
  GatewayChannelCreateDispatchData,
  GatewayChannelUpdateDispatchData,
  GatewayChannelDeleteDispatchData,
} from 'discord-api-types/gateway/v10';
import { KafkaClient } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { ChannelEventPayloadSchema, ChannelEventPayload } from '@cipibot/schemas/discord';

export async function handleChannelCreate(
  kafka: KafkaClient,
  data: GatewayChannelCreateDispatchData,
): Promise<void> {
  if (!data.guild_id) {
    return;
  }

  const payload: ChannelEventPayload = ChannelEventPayloadSchema.parse({
    guildId: data.guild_id,
    channelId: data.id,
  });

  await kafka.sendEvent(
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_CREATE,
    payload,
    { key: payload.guildId },
  );
}

export async function handleChannelUpdate(
  kafka: KafkaClient,
  data: GatewayChannelUpdateDispatchData,
): Promise<void> {
  if (!data.guild_id) {
    return;
  }

  const payload: ChannelEventPayload = ChannelEventPayloadSchema.parse({
    guildId: data.guild_id,
    channelId: data.id,
  });

  await kafka.sendEvent(
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_UPDATE,
    payload,
    { key: payload.guildId },
  );
}

export async function handleChannelDelete(
  kafka: KafkaClient,
  data: GatewayChannelDeleteDispatchData,
): Promise<void> {
  if (!data.guild_id) {
    return;
  }

  const payload: ChannelEventPayload = ChannelEventPayloadSchema.parse({
    guildId: data.guild_id,
    channelId: data.id,
  });

  await kafka.sendEvent(
    KAFKA_TOPICS.DISCORD_INBOUND.CHANNEL_DELETE,
    payload,
    { key: payload.guildId },
  );
}
