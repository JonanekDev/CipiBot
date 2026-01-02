import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';
import { RedisClient } from '@cipibot/redis';
import { Guild, GuildConfigSchema, GuildConfigType, DeepPartial } from '@cipibot/schemas';
import { createTRPCClient, httpBatchLink, TRPCClient } from '@trpc/client';
import type { ConfigRouter } from '@cipibot/config/router';
import { Logger } from '@cipibot/logger';

const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL || 'http://localhost:3000/trpc';

export class ConfigClient {
  private readonly redis: RedisClient;
  private readonly logger: Logger;
  private trpc: TRPCClient<ConfigRouter>;

  constructor(redis: RedisClient, logger: Logger) {
    this.redis = redis;
    this.logger = logger.child({ package: 'ConfigClient' });
    this.trpc = createTRPCClient<ConfigRouter>({
      links: [
        httpBatchLink({
          url: CONFIG_SERVICE_URL,
        }),
      ],
    });
  }

  async getGuildConfig(guildId: string): Promise<GuildConfigType> {
    const cacheKey = `${REDIS_KEYS.GUILD_CONFIG}${guildId}`;

    try {
      const cached = await this.redis.get(cacheKey, 'EX', CACHE_TTL.GUILD_CONFIG);

      if (cached) {
        return GuildConfigSchema.parse(JSON.parse(cached));
      }
    } catch (error) {
      this.logger.error({ error, guildId }, 'Failed to get guild config from Redis cache');
    }
    try {
      const configWithoutDefault = await this.trpc.getGuildConfig.query({ id: guildId });

      const config = GuildConfigSchema.safeParse(configWithoutDefault ?? {});
      if (!config.success) {
        this.logger.error({ guildId, errors: config.error }, 'Invalid guild config data');
        throw new Error(`[ConfigClient] Error parsing guild config for ${guildId}`);
      }
      return config.data;
    } catch (error) {
      this.logger.error({ error, guildId }, 'Failed to fetch guild config from Config service');
      throw error;
    }
  }

  async getGuild(guildId: string): Promise<DeepPartial<Guild>> {
    try {
      const guildWithoutDefault = await this.trpc.getGuild.query({ id: guildId });

      return (guildWithoutDefault || {}) as DeepPartial<Guild>;
    } catch (error) {
      this.logger.error({ error, guildId }, 'Failed to fetch guild from Config service');
      throw error;
    }
  }

  async getKnownGuilds(guildIds: string[]): Promise<string[]> {
    try {
      return await this.trpc.filterKnownGuilds.query({ ids: guildIds });
    } catch (error) {
      this.logger.error({ error, guildIds }, 'Failed to fetch known guilds from Config service');
      throw error;
    }
  }
}
