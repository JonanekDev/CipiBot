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
