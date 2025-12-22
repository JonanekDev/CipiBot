import { GatewayIntentBits } from '@discordjs/core';

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error('DISCORD_BOT_TOKEN is not set');
}

export const CONFIG = {
  TOKEN: process.env.DISCORD_BOT_TOKEN,
  INTENTS:
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.Guilds |
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.GuildMembers,
};
