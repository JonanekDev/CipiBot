import { CACHE_TTL, REDIS_KEYS } from '@cipibot/constants';
import { getRedis } from '@cipibot/redis';
import { GuildConfigSchema, GuildConfigType } from '@cipibot/schemas';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { ConfigRouter } from '@cipibot/config/router';

const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL || 'http://localhost:3000/trpc';

const trpc = createTRPCClient<ConfigRouter>({
  links: [
    httpBatchLink({
      url: CONFIG_SERVICE_URL,
    }),
  ],
});

export async function getGuildConfig(guildId: string): Promise<GuildConfigType> {
  const redis = getRedis();
  const cacheKey = `${REDIS_KEYS.GUILD_CONFIG}${guildId}`;

  const cached = await redis.getex(cacheKey, 'EX', CACHE_TTL.GUILD_CONFIG);

  if (cached) {
    return GuildConfigSchema.parse(JSON.parse(cached));
  }

  const configWithotuDefault = await trpc.getGuildConfig.query({ id: guildId });

  const config = GuildConfigSchema.safeParse(configWithotuDefault ?? {});

  if (!config.success) {
    throw new Error(`[ConfigClient] Error parsing guild config for ${guildId}`);
  }

  return config.data;
}

export async function getKnownGuilds(guildIds: string[]): Promise<string[]> {
  return await trpc.filterKnownGuilds.query({ ids: guildIds });
}
