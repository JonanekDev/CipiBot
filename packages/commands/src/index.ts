import { CACHE_TTL, KAFKA_TOPICS, REDIS_KEYS } from '@cipibot/constants';
import { RedisClient } from '@cipibot/redis';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { CommandInteraction } from '@cipibot/schemas/discord';
import { UpdateCommandPayload } from '@cipibot/schemas';
import { Logger } from '@cipibot/logger';
import { KafkaClient } from '@cipibot/kafka';

export interface Command {
  definition: RESTPostAPIApplicationCommandsJSONBody;
  handler: (interaction: CommandInteraction) => Promise<void> | void;
}

export class CommandRegistry {
  private readonly kafka: KafkaClient;
  private readonly redis: RedisClient;
  private readonly logger: Logger;
  private readonly serviceName: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(serviceName: string, kafka: KafkaClient, redis: RedisClient, logger: Logger) {
    this.serviceName = serviceName;
    this.kafka = kafka;
    this.redis = redis;
    this.logger = logger.child({ package: 'CommandRegistry' });
  }

  public getServiceCommandTopic(serviceName?: string): string {
    const name = serviceName || this.serviceName;
    return `service.${name}.commands`;
  }

  private async setCommandRoute(command: string): Promise<void> {
    const redisKey = `${REDIS_KEYS.COMMAND_ROUTE}${command}`;
    try {
      await this.redis.set(redisKey, this.serviceName, 'EX', CACHE_TTL.COMMAND_ROUTE);
    } catch (error) {
      this.logger.error({ command, error }, 'Failed to set command route in Redis');
    }
  }

  public async getCommandRoute(command: string): Promise<string | null> {
    const redisKey = `${REDIS_KEYS.COMMAND_ROUTE}${command}`;
    return await this.redis.get(redisKey);
  }

  public startHeartbeat(commands: string[]): void {
    if (this.heartbeatInterval) {
      this.logger.warn('Heartbeat is already running');
      return;
    }

    const register = async () => {
      await Promise.all(commands.map(async (cmd) => await this.setCommandRoute(cmd)));
    };

    register();
    this.heartbeatInterval = setInterval(register, (CACHE_TTL.COMMAND_ROUTE * 1000) / 2);
    this.logger.info({ commands }, 'Command route heartbeat started');
  }

  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      this.logger.info('Command route heartbeat stopped');
    }
  }

  public async publishDefinitions(
    definitions: RESTPostAPIApplicationCommandsJSONBody[],
  ): Promise<void> {
    try {
      await this.redis.hset(
        REDIS_KEYS.COMMAND_DEFINITIONS,
        this.serviceName,
        JSON.stringify(definitions),
      );

      const eventData: UpdateCommandPayload = {
        serviceName: this.serviceName,
      };

      await this.kafka.sendEvent(KAFKA_TOPICS.SYSTEM.COMMANDS_UPDATE, eventData);

      this.logger.info({ count: definitions.length }, 'Published command definitions successfully');
    } catch (error) {
      this.logger.error({ error }, 'Failed to publish command definitions');
    }
  }
}
