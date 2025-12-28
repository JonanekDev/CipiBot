import { REST } from '@discordjs/rest';
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { RedisClient } from '@cipibot/redis';
import { REDIS_KEYS } from '@cipibot/constants';
import { Logger } from '@cipibot/logger';

export class CommandsService {
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 30000;
  private readonly logger: Logger;

  constructor(
    private readonly rest: REST,
    logger: Logger,
    private readonly redis: RedisClient,
    private readonly clientId: string,
  ) {
    this.logger = logger.child({ module: 'CommandsService' });
  }

  triggerSync(serviceTriggerName: string) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.logger.info(
      { serviceTriggerName },
      `Sync triggered. Waiting for other services to publish their command definitions...`,
    );

    this.debounceTimer = setTimeout(() => {
      this.syncCommands().catch((err) => {
        console.error('[CommandsService] Sync failed:', err);
      });
    }, this.DEBOUNCE_MS);
  }

  private async syncCommands() {
    this.logger.info('Starting command sync with Discord API...');

    try {
      const data = await this.redis.hgetall(REDIS_KEYS.COMMAND_DEFINITIONS);

      if (!data) {
        this.logger.error('No command definitions found in Redis.');
        return;
      }

      const allCommands: RESTPostAPIApplicationCommandsJSONBody[] = Object.values(data).flatMap(
        (jsonString) => {
          try {
            return JSON.parse(jsonString);
          } catch (e) {
            this.logger.error(e, 'Failed to parse command definition JSON from Redis.');
            return [];
          }
        },
      );

      this.logger.info(
        `Aggregated ${allCommands.length} commands from ${Object.keys(data).length} services.`,
      );

      await this.rest.put(Routes.applicationCommands(this.clientId), {
        body: allCommands,
      });

      this.logger.info('Successfully synced commands with Discord API.');
    } catch (error) {
      this.logger.error(error, 'Fatal error during command sync');
      throw error;
    } finally {
      this.debounceTimer = null;
    }
  }
}
