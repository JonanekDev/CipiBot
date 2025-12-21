import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import { CONFIG } from './config';

export function createManager() {
  const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);

  const manager = new WebSocketManager({
    token: CONFIG.TOKEN,
    intents: CONFIG.INTENTS,
    rest,
  });

  return manager;
}
