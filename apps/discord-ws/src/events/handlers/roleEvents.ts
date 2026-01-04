import {
  GatewayGuildRoleCreateDispatchData,
  GatewayGuildRoleUpdateDispatchData,
  GatewayGuildRoleDeleteDispatchData,
} from 'discord-api-types/gateway/v10';
import { KafkaClient } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { RoleEventPayloadSchema, RoleEventPayload } from '@cipibot/schemas/discord';

export async function handleRoleCreate(
  kafka: KafkaClient,
  data: GatewayGuildRoleCreateDispatchData,
): Promise<void> {
  const payload: RoleEventPayload = RoleEventPayloadSchema.parse({
    guildId: data.guild_id,
    roleId: data.role.id,
  });

  await kafka.sendEvent(
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_CREATE,
    payload,
    { key: payload.guildId },
  );
}

export async function handleRoleUpdate(
  kafka: KafkaClient,
  data: GatewayGuildRoleUpdateDispatchData,
): Promise<void> {
  const payload: RoleEventPayload = RoleEventPayloadSchema.parse({
    guildId: data.guild_id,
    roleId: data.role.id,
  });

  await kafka.sendEvent(
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_UPDATE,
    payload,
    { key: payload.guildId },
  );
}

export async function handleRoleDelete(
  kafka: KafkaClient,
  data: GatewayGuildRoleDeleteDispatchData,
): Promise<void> {
  const payload: RoleEventPayload = RoleEventPayloadSchema.parse({
    guildId: data.guild_id,
    roleId: data.role_id,
  });

  await kafka.sendEvent(
    KAFKA_TOPICS.DISCORD_INBOUND.GUILD_ROLE_DELETE,
    payload,
    { key: payload.guildId },
  );
}
