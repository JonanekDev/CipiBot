import {
  DeepPartial,
  Guild,
  type GuildConfigPatchType,
  type GuildConfig,
} from '@cipibot/schemas';
import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';
import { ConfigRepository } from './repository';
import { GuildUpdatePayload } from '@cipibot/schemas/discord';
import { RedisClient } from '@cipibot/redis';
import { isValidLanguage, SupportedLanguage, t } from '@cipibot/i18n';
import { TRPCError } from '@trpc/server';
import { mergeConfig } from './utils/mergeConfig';

export class ConfigService {
  constructor(
    private readonly redis: RedisClient,
    private readonly configRepository: ConfigRepository,
  ) {}

  getGuildConfigCacheKey(guildId: string): string {
    return `${REDIS_KEYS.GUILD_CONFIG}${guildId}`;
  }

  async getGuild(guildId: string): Promise<DeepPartial<Guild>> {
    const guildData = await this.configRepository.getGuild(guildId);

    if (!guildData) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Guild with ID ${guildId} not found`,
      });
    }

    let rawConfig = guildData.config;

    const config = (rawConfig ?? {}) as DeepPartial<GuildConfig>;

    await this.redis.set(
      this.getGuildConfigCacheKey(guildId),
      JSON.stringify(config),
      'EX',
      CACHE_TTL.GUILD_CONFIG,
    );

    const guild: DeepPartial<Guild> = {
      id: guildData.id,
      name: guildData.name,
      icon: guildData.icon,
      config: config,
      removed: guildData.removed,
    };

    return guild;
  }

  async getGuildConfig(guildId: string): Promise<DeepPartial<GuildConfig>> {
    const cacheKey = this.getGuildConfigCacheKey(guildId);

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as DeepPartial<GuildConfig>;
      // Ensure ignoreChannelIds doesn't contain null values
      if (parsed.leveling?.ignoreChannelIds) {
        parsed.leveling.ignoreChannelIds = parsed.leveling.ignoreChannelIds.filter(
          (id): id is string => id !== null && id !== undefined,
        );
      }
      return parsed;
    }

    const guild = await this.configRepository.getGuild(guildId);

    const config = (guild?.config ?? {}) as unknown as DeepPartial<GuildConfig>;
    await this.redis.set(cacheKey, JSON.stringify(config), 'EX', CACHE_TTL.GUILD_CONFIG);

    return config;
  }

  async updateGuildConfig(
    guildId: string,
    patch: DeepPartial<GuildConfig>,
  ): Promise<DeepPartial<GuildConfig>> {
    const current = await this.getGuildConfig(guildId);

    // Merge config with proper array handling
    const merged = mergeConfig(current, patch) as DeepPartial<GuildConfig>;

    await this.configRepository.updateGuildConfig(guildId, merged);

    const cacheKey = this.getGuildConfigCacheKey(guildId);
    await this.redis.set(cacheKey, JSON.stringify(merged), 'EX', CACHE_TTL.GUILD_CONFIG);

    return merged;
  }

  async upsertGuild(guild: GuildUpdatePayload): Promise<void> {
    let language: SupportedLanguage = 'en';
    const preferredLocale = guild.preferred_locale.split('-')[0];

    if (isValidLanguage(preferredLocale)) {
      language = preferredLocale;
    }

    const guildConfig: GuildConfigPatchType = {
      language,
    };

    const guildRecord = await this.configRepository.upsertGuild(
      guild.id,
      guild.name,
      guild.icon,
      guildConfig,
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

  async removeGuild(guildId: string): Promise<void> {
    await this.configRepository.guildRemove(guildId);
  }
}
