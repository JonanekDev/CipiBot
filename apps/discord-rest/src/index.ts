import { registerConsumers } from './consumers';
import { DiscordRestService } from './service';

async function main() {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!DISCORD_BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN is not set in environment variables.');
    process.exit(1);
  }
  const discordRestService = new DiscordRestService(DISCORD_BOT_TOKEN);
  registerConsumers(discordRestService).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
