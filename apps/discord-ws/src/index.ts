import { GatewayIntentBits, RESTGetAPIGatewayBotResult, Routes } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws';
import { APIGuild, APIMessage, GatewayDispatchEvents } from 'discord-api-types/v10';
import { sendEvent, disconnectProducer } from '@cipibot/kafka';
import dotenv from 'dotenv';

dotenv.config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!DISCORD_BOT_TOKEN) {
  console.error('DISCORD_BOT_TOKEN is not set in environment variables.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

const manager = new WebSocketManager({
  token: DISCORD_BOT_TOKEN,
  intents:
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.Guilds |
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.GuildMembers,
  rest,
});

manager.on('ready', () => {
  console.log('Bot is ready!');
});

manager.on(WebSocketShardEvents.Dispatch, async (event) => {
  switch (event.t) {
    case GatewayDispatchEvents.GuildCreate:
      {
        const guild = event.d as APIGuild;
        await sendEvent('discord.guild.create', guild, {
          key: guild.id,
        });
      }
      break;
    case GatewayDispatchEvents.GuildUpdate:
      {
        const guild = event.d as APIGuild;
        await sendEvent('discord.guild.update', guild, { key: guild.id });
      }
      break;
    case GatewayDispatchEvents.GuildDelete:
      {
        const guild = event.d as APIGuild;
        await sendEvent('discord.guild.delete', guild, { key: guild.id });
      }
      break;
    case GatewayDispatchEvents.MessageCreate:
      {
        const message = event.d as APIMessage & { guild_id?: string };
        const key = message.guild_id || message.author.id;
        await sendEvent('discord.message.create', message, { key });
      }
      break;
  }
});

manager.connect();

// Before exiting, disconnect the WebSocket manager
process.on('SIGINT', async () => {
  console.log('Disconnecting WebSocket manager...');
  await manager.destroy();
  await disconnectProducer();
  process.exit(0);
});
