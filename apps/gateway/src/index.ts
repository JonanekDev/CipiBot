import { GatewayIntentBits, RESTGetAPIGatewayBotResult, Routes } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws';
import { APIMessage, GatewayDispatchEvents } from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import dotenv from 'dotenv';

dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

const manager = new WebSocketManager({
  token: process.env.DISCORD_BOT_TOKEN!,
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

    if (event.t === GatewayDispatchEvents.MessageCreate) {
        const message = event.d as APIMessage & { guild_id?: string };
        const key = message.guild_id || message.author.id;
        sendEvent('discord.message.create', message, key);
    }
  console.log(`Received event: ${JSON.stringify(event)}`);
});

manager.connect();


