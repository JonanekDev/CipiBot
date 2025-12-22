export const REDIS_KEYS = {
  GUILD_CONFIG: 'config:guild:',
  DISCORD_USER: 'discord:user:',
} as const;

export const CACHE_TTL = {
  GUILD_CONFIG: 1800,
  DISCORD_USER: 3200,
} as const;
