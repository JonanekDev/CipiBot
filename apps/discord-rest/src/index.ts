import { registerConsumers } from './consumers';
import { DiscordRestService } from './service';
import { CommandsService } from './services/commands.service';
import { REST } from '@discordjs/rest';

async function main() {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

  if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
    console.error('DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID is not set in environment variables.');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  const commandsService = new CommandsService(rest, DISCORD_CLIENT_ID);

  const discordRestService = new DiscordRestService(DISCORD_BOT_TOKEN);

  registerConsumers(discordRestService, commandsService).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
