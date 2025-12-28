import { CACHE_TTL, KAFKA_TOPICS, REDIS_KEYS } from '@cipibot/constants';
import { getRedis } from '@cipibot/redis';
import { sendEvent } from '@cipibot/kafka';
import {
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction } from '@cipibot/schemas/discord';
import { UpdateCommandPayloadType } from '@cipibot/schemas';

export interface Command {
  definition: RESTPostAPIApplicationCommandsJSONBody;
  handler: (interaction: CommandInteraction) => Promise<void> | void;
}

// Commands routing

async function setCommandRoute(command: string, serviceName: string): Promise<void> {
  const redis = getRedis();
  const key = `${REDIS_KEYS.COMMAND_ROUTE}${command}`;
  await redis.set(key, serviceName, 'EX', CACHE_TTL.COMMAND_ROUTE);
}

export async function getCommandRoute(command: string): Promise<string | null> {
  const redis = getRedis();
  const key = `${REDIS_KEYS.COMMAND_ROUTE}${command}`;
  return redis.get(key);
}

export function getServiceCommandTopic(serviceName: string): string {
  return `service.${serviceName}.commands`;
}

export function startCommandHeartbeat(serviceName: string, commands: string[]): () => void {
  const register = async () => {
    try {
      await Promise.all(commands.map((cmd) => setCommandRoute(cmd, serviceName)));
    } catch (err) {
      console.error(`[Redis] Failed to refresh command routes for ${serviceName}:`, err);
    }
  };

  register();

  const interval = setInterval(register, (CACHE_TTL.COMMAND_ROUTE * 1000) / 2);
  return () => clearInterval(interval);
}

// Command definitions publishing
export async function publishCommandDefinitions(
  serviceName: string,
  definitions: RESTPostAPIApplicationCommandsJSONBody[],
): Promise<void> {
  const redis = getRedis();

  await redis.hset(REDIS_KEYS.COMMAND_DEFINITIONS, serviceName, JSON.stringify(definitions));

  const eventData: UpdateCommandPayloadType = {
    serviceName: serviceName,
  }

  await sendEvent(KAFKA_TOPICS.SYSTEM.COMMANDS_UPDATE, eventData);

  console.log(`[Commands] Published ${definitions.length} definitions for ${serviceName}`);
}
