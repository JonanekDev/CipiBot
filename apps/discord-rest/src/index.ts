import Fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { registerConsumers, shutdownConsumers } from './consumers';
import { createDiscordRestRouter } from './router';
import { DiscordRestService } from './service';
import { CommandsService } from './services/commands.service';
import { REST } from '@discordjs/rest';
import { InteractionsService } from './services/interactions.service';

async function main() {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

  if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
    console.error('DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID is not set in environment variables.');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  const commandsService = new CommandsService(rest, DISCORD_CLIENT_ID);
  const interactionsService = new InteractionsService(rest, DISCORD_CLIENT_ID);

  const discordRestService = new DiscordRestService(DISCORD_BOT_TOKEN);

  registerConsumers(discordRestService, commandsService, interactionsService).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });

  const app = Fastify({
    logger: true,
  });

  // Register routes
  const discordRestRouter = createDiscordRestRouter(interactionsService);

  app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: discordRestRouter,
    },
  });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3003', 10);
  await app.listen({ port: APP_PORT });
  console.log(`Discord REST service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    console.log('Shutting down...');
    await app.close();
    await shutdownConsumers();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
