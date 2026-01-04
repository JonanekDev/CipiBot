import { Logger } from '@cipibot/logger';
import { REST } from '@discordjs/rest';
import { RESTGetAPIGuildRolesResult, Routes } from 'discord-api-types/v10';
import { safeDiscordRequest } from '../utils/discord';
import { Role, RoleSchema } from '@cipibot/schemas/discord';
import { RedisClient } from '@cipibot/redis';
import { z } from 'zod';
import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';

export class RolesService {
  private readonly logger: Logger;

  constructor(
    private readonly rest: REST,
    private readonly redis: RedisClient,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: 'RolesService' });
  }

  private getCacheKey(guildId: string): string {
    return `${REDIS_KEYS.DISCORD_GUILD_ROLES}${guildId}`;
  }

  async addRoleToMember(guildId: string, userId: string, roleId: string): Promise<void> {
    await safeDiscordRequest(
      () => this.rest.put(Routes.guildMemberRole(guildId, userId, roleId)),
      this.logger,
      { guildId, userId, roleId },
    );
  }

  async removeRoleFromMember(guildId: string, userId: string, roleId: string): Promise<void> {
    await safeDiscordRequest(
      () => this.rest.delete(Routes.guildMemberRole(guildId, userId, roleId)),
      this.logger,
      { guildId, userId, roleId },
    );
  }

  async getGuildRoles(guildId: string): Promise<Role[]> {
    const cacheKey = this.getCacheKey(guildId);
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const validated = z.array(RoleSchema).parse(parsed);
        this.logger.debug({ guildId }, 'Returning cached guild roles');
        return validated;
      } catch (error) {
        this.logger.warn({ guildId, error }, 'Failed to parse cached roles, fetching fresh data');
        await this.redis.del(cacheKey);
      }
    }

    const roles = (await safeDiscordRequest(
      () => this.rest.get(Routes.guildRoles(guildId)),
      this.logger,
      { guildId },
    )) as RESTGetAPIGuildRolesResult;

    const validated = z.array(RoleSchema).parse(roles);

    await this.redis.set(cacheKey, JSON.stringify(validated), 'EX', CACHE_TTL.DISCORD_GUILD_ROLES);
    this.logger.debug({ guildId }, 'Cached guild roles');
    
    return validated;
  }

  async invalidateCache(guildId: string): Promise<void> {
    const cacheKey = this.getCacheKey(guildId);
    await this.redis.del(cacheKey);
    this.logger.info({ guildId }, 'Invalidated guild roles cache');
  }
}
