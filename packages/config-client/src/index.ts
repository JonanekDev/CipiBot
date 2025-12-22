import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';
import { getRedis } from '@cipibot/redis';
import { GuildConfigSchema, GuildConfigType } from '@cipibot/schemas';
import axios from 'axios';

const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL || 'http://localhost:3000';

export async function getGuildConfig(guildId: string): Promise<GuildConfigType> {
  const redis = getRedis();
  const cacheKey = `${REDIS_KEYS.GUILD_CONFIG}${guildId}`;

  const cached = await redis.getex(cacheKey, 'EX', CACHE_TTL.GUILD_CONFIG);

  if (cached) {
    return GuildConfigSchema.parse(JSON.parse(cached));
  }

  const response = await axios.get(`${CONFIG_SERVICE_URL}/guilds/${guildId}/config`);
  
  const result = GuildConfigSchema.safeParse(response.data ?? {});

  if (!result.success) {
    console.error(`[ConfigClient] Invalid config data from service for ${guildId}`, result.error);
    throw new Error('Invalid configuration data received');
  }

  const validConfig = result.data;

  return validConfig;
}

export async function getKnownGuilds(guildIds: string[]): Promise<string[]> {
  //TODO: Cache
  const response = await axios.get<string[]>(`${CONFIG_SERVICE_URL}/guilds/known`, {
    params: { ids: guildIds },
  });

  return response.data;
  
}