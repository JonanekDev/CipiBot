import { DeepPartial, type GuildConfigType } from '@cipibot/schemas';
import { defu } from 'defu';
import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';
import { ConfigRepository } from './repository';
import { GuildUpdatePayload } from '@cipibot/schemas/discord';
import { RedisClient } from '@cipibot/redis';

export class ConfigService {
  constructor(
    private readonly redis: RedisClient,
    private readonly configRepository: ConfigRepository,
  ) {}

  getGuildConfigCacheKey(guildId: string): string {
    return `${REDIS_KEYS.GUILD_CONFIG}${guildId}`;
  }

  async getGuildConfig(guildId: string): Promise<DeepPartial<GuildConfigType>> {
    const cacheKey = this.getGuildConfigCacheKey(guildId);

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const guild = (await this.configRepository.getGuildConfig(guildId)) as {
      config: GuildConfigType;
    } | null;

    const config = (guild?.config ?? {}) as DeepPartial<GuildConfigType>;
    await this.redis.set(cacheKey, JSON.stringify(config), 'EX', CACHE_TTL.GUILD_CONFIG);

    return config;
  }

  async updateGuildConfig(
    guildId: string,
    patch: DeepPartial<GuildConfigType>,
  ): Promise<DeepPartial<GuildConfigType>> {
    const current = await this.getGuildConfig(guildId);
    const merged = defu(patch, current) as DeepPartial<GuildConfigType>;

    const cleanConfig = {
      ...merged,
      leveling: {
        ...merged.leveling,
        ignoreChannelIds:
          merged.leveling?.ignoreChannelIds?.filter((id): id is string => id !== undefined) ?? [],
      },
    };

    await this.configRepository.upsertGuildConfig(guildId, cleanConfig);

    const cacheKey = this.getGuildConfigCacheKey(guildId);
    await this.redis.set(cacheKey, JSON.stringify(cleanConfig), 'EX', CACHE_TTL.GUILD_CONFIG);

    return cleanConfig;
  }

  async upsertGuild(guild: GuildUpdatePayload): Promise<void> {
    const guildRecord = await this.configRepository.upsertGuildWithoutConfig(
      guild.id,
      guild.name,
      guild.icon,
    );
    const cacheKey = this.getGuildConfigCacheKey(guild.id);
    await this.redis.set(
      cacheKey,
      JSON.stringify(guildRecord.config),
      'EX',
      CACHE_TTL.GUILD_CONFIG,
    );
  }

  async filterKnownGuilds(guildIds: string[]): Promise<string[]> {
    return this.configRepository.filterKnownGuilds(guildIds);
  }
}
