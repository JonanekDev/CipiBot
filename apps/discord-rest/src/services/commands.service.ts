import { REST } from '@discordjs/rest';
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { getRedis } from '@cipibot/redis';
import { REDIS_KEYS } from '@cipibot/constants';

export class CommandsService {
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 30000;

  constructor(
    private readonly rest: REST,
    private readonly clientId: string,
  ) {}

  triggerSync(serviceName: string) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    console.log(
      `[CommandsService] Sync triggered by ${serviceName}. Waiting for other services to publish their command definitions...`,
    );

    this.debounceTimer = setTimeout(() => {
      this.syncCommands().catch((err) => {
        console.error('[CommandsService] Sync failed:', err);
      });
    }, this.DEBOUNCE_MS);
  }

  private async syncCommands() {
    console.log('[CommandsService] Starting global command synchronization...');
    const redis = getRedis();

    try {
      const data = await redis.hgetall(REDIS_KEYS.COMMAND_DEFINITIONS);

      if (!data) {
        console.error('[CommandsService] No command definitions found in Redis.');
        return;
      }

      const allCommands: RESTPostAPIApplicationCommandsJSONBody[] = Object.values(data).flatMap(
        (jsonString) => {
          try {
            return JSON.parse(jsonString);
          } catch (e) {
            console.error('[CommandsService] Failed to parse definition chunk:', e);
            return [];
          }
        },
      );

      console.log(
        `[CommandsService] Aggregated ${allCommands.length} commands from ${Object.keys(data).length} services.`,
      );

      await this.rest.put(Routes.applicationCommands(this.clientId), {
        body: allCommands,
      });

      console.log('[CommandsService] Discord API sync complete.');
    } catch (error) {
      console.error('[CommandsService] Fatal error during command sync:', error);
      throw error;
    } finally {
      this.debounceTimer = null;
    }
  }
}
