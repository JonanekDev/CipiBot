import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';
import {
  GuildMemberPayload,
  GuildMemberPayloadSchema,
  GuildMemberRemovePayload,
  GuildMemberRemovePayloadSchema,
} from '@cipibot/schemas/discord';
import {
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberRemoveDispatchData,
} from 'discord-api-types/gateway/v10';

export async function handleMemberAdd(kafka: KafkaClient, data: GatewayGuildMemberAddDispatchData) {
  const payload: GuildMemberPayload = GuildMemberPayloadSchema.parse({
    guild_id: data.guild_id,
    user: data.user,
    roles: data.roles,
    joined_at: data.joined_at,
    flags: data.flags,
  });

  await kafka.sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_ADD, payload, {
    key: payload.guild_id,
  });
}

export async function handleMemberRemove(
  kafka: KafkaClient,
  data: GatewayGuildMemberRemoveDispatchData,
) {
  const payload: GuildMemberRemovePayload = GuildMemberRemovePayloadSchema.parse({
    guild_id: data.guild_id,
    user: data.user,
  });

  await kafka.sendEvent(KAFKA_TOPICS.DISCORD_INBOUND.GUILD_MEMBER_REMOVE, payload, {
    key: payload.guild_id,
  });
}
