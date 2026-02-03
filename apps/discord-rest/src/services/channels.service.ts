import { GuildChannel, GuildChannelSchema } from '@cipibot/schemas';
import { REST } from '@discordjs/rest';
import { ChannelType, RESTGetAPIGuildChannelsResult, Routes } from 'discord-api-types/v10';
import { safeDiscordRequest } from '../utils/discord';
import { Logger } from '@cipibot/logger';
import { RedisClient } from '@cipibot/redis';
import { z } from 'zod';
import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';

export class ChannelsService {
  private readonly logger: Logger;

  constructor(
    private readonly rest: REST,
    private readonly redis: RedisClient,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: 'ChannelsService' });
  }

  private getCacheKey(guildId: string): string {
    return `${REDIS_KEYS.DISCORD_GUILD_CHANNELS}${guildId}`;
  }

  async getGuildChannels(guildId: string): Promise<GuildChannel[]> {
    const cacheKey = this.getCacheKey(guildId);
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const validated = z.array(GuildChannelSchema).parse(parsed);
        this.logger.debug({ guildId }, 'Returning cached guild channels');
        return validated;
      } catch (error) {
        this.logger.warn(
          { guildId, error },
          'Failed to parse cached channels, fetching fresh data',
        );
        await this.redis.del(cacheKey);
      }
    }

    const channels = (await safeDiscordRequest(
      () => this.rest.get(Routes.guildChannels(guildId)),
      this.logger,
      { guildId },
    )) as RESTGetAPIGuildChannelsResult;

    const validated = z.array(GuildChannelSchema).parse(channels);

    await this.redis.set(
      cacheKey,
      JSON.stringify(validated),
      'EX',
      CACHE_TTL.DISCORD_GUILD_CHANNELS,
    );
    this.logger.debug({ guildId }, 'Cached guild channels');

    return validated;
  }

  async invalidateCache(guildId: string): Promise<void> {
    const cacheKey = this.getCacheKey(guildId);
    await this.redis.del(cacheKey);
    this.logger.info({ guildId }, 'Invalidated guild channels cache');
  }

  async createTextChannel(guildId: string, name: string): Promise<GuildChannel> {
    this.logger.info({ guildId, name }, 'Creating text channel');

    const body = {
      name,
      type: ChannelType.GuildText,
    };

    const channel = (await safeDiscordRequest(
      () => this.rest.post(Routes.guildChannels(guildId), { body }),
      this.logger,
      { guildId, name },
    )) as GuildChannel;

    this.logger.info({ guildId, channelId: channel.id, name }, 'Text channel created');

    await this.invalidateCache(guildId);

    return channel;
  }
}
