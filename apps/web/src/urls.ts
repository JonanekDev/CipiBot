import { DISCORD } from '@cipibot/constants';

const BASE_URL = 'https://discord.com/oauth2/authorize';

// User Login URL
const loginUrl = new URL(BASE_URL);
loginUrl.searchParams.append('client_id', DISCORD.CLIENT_ID);
loginUrl.searchParams.append('response_type', 'code');
loginUrl.searchParams.append('redirect_uri', DISCORD.REDIRECT_URI);
loginUrl.searchParams.append('scope', 'identify guilds');

export const loginURL = loginUrl.toString();

// Bot Invitation URL
const botUrl = new URL(BASE_URL);
botUrl.searchParams.append('client_id', DISCORD.CLIENT_ID);
botUrl.searchParams.append('permissions', '8');
botUrl.searchParams.append('scope', 'bot applications.commands identify guilds');
botUrl.searchParams.append('redirect_uri', DISCORD.REDIRECT_URI);
botUrl.searchParams.append('response_type', 'code');

export const addBotURL = botUrl.toString();

export function generateGuildInviteURL(guildId: string): string {
  const url = new URL(BASE_URL);
  url.searchParams.append('client_id', DISCORD.CLIENT_ID);
  url.searchParams.append('permissions', '8');
  url.searchParams.append('scope', 'bot applications.commands');
  url.searchParams.append('guild_id', guildId);
  url.searchParams.append('disable_guild_select', 'true');
  return url.toString();
}
