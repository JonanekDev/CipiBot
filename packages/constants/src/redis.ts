export const REDIS_KEYS = {
  GUILD_CONFIG: 'config:guild:',
  DISCORD_USER: 'discord:user:',
  COMMAND_ROUTE: 'cmd:route:',
  COMMAND_DEFINITIONS: 'cmd:definitions', // Hash key
  DISCORD_GUILD_CHANNELS: 'discord:guild:channels:',
  DISCORD_GUILD_ROLES: 'discord:guild:roles:',
} as const;

export const CACHE_TTL = {
  GUILD_CONFIG: 1800,
  DISCORD_USER: 3200,
  COMMAND_ROUTE: 120,
  DISCORD_GUILD_CHANNELS: 600,
  DISCORD_GUILD_ROLES: 600,
} as const;
