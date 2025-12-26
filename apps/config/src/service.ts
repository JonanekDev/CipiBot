import { PrismaClient } from './generated/prisma/client';
import type { Redis } from '@cipibot/redis';
import { DeepPartial, type GuildConfigType } from '@cipibot/schemas';
import { APIGuild } from 'discord-api-types/v10';
import { defu } from 'defu';
import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';
import { ConfigRepository } from './repository';

export class ConfigService {
  constructor(
    private readonly redis: Redis,
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

    const guild = await this.configRepository.getGuildConfig(guildId) as { config: GuildConfigType } | null;

    const config = (guild?.config ?? {}) as DeepPartial<GuildConfigType>;
    await this.redis.setex(cacheKey, CACHE_TTL.GUILD_CONFIG, JSON.stringify(config));

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
    await this.redis.setex(cacheKey, CACHE_TTL.GUILD_CONFIG, JSON.stringify(cleanConfig));

    return cleanConfig;
  }

  async upsertGuild(guild: APIGuild): Promise<void> {
    const guildRecord = await this.configRepository.upsertGuildWithoutConfig(
      guild.id,
      guild.name,
      guild.icon,
    );
    const cacheKey = this.getGuildConfigCacheKey(guild.id);
    await this.redis.setex(cacheKey, CACHE_TTL.GUILD_CONFIG, JSON.stringify(guildRecord.config));
  }

  async filterKnownGuilds(guildIds: string[]): Promise<string[]> {
    return this.configRepository.filterKnownGuilds(guildIds);
  }
}
