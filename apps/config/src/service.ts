import { PrismaClient } from './generated/prisma/client';
import type { Redis } from '@cipibot/redis';
import { DeepPartial, type GuildConfigType } from '@cipibot/schemas';
import { APIGuild } from 'discord-api-types/v10';
import { defu } from 'defu';
import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';

export class ConfigService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis,
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

    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      select: { config: true },
    });

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

    await this.prisma.guild.upsert({
      where: { id: guildId },
      create: { id: guildId, config: merged },
      update: { config: merged },
    });

    const cacheKey = this.getGuildConfigCacheKey(guildId);
    await this.redis.setex(cacheKey, CACHE_TTL.GUILD_CONFIG, JSON.stringify(merged));

    return merged;
  }

  async upsertGuild(guild: APIGuild): Promise<void> {
    const guildRecord = await this.prisma.guild.upsert({
      where: { id: guild.id },
      create: { id: guild.id, name: guild.name, icon: guild.icon },
      update: { name: guild.name, icon: guild.icon },
    });
    const cacheKey = this.getGuildConfigCacheKey(guild.id);
    await this.redis.setex(cacheKey, CACHE_TTL.GUILD_CONFIG, JSON.stringify(guildRecord.config));
  }
}
