import Fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { registerConsumers } from './consumers';
import { createDiscordRestRouter } from './router';
import { CommandsService } from './services/commands.service';
import { REST } from '@discordjs/rest';
import { InteractionsService } from './services/interactions.service';
import { RolesService } from './services/roles.service';
import { MessagesService } from './services/messages.service';
import { createLogger } from '@cipibot/logger';
import { KafkaClient } from '@cipibot/kafka';
import { RedisClient } from '@cipibot/redis';
import { ChannelsService } from './services/channels.service';

const SERVICE_NAME = 'discord-rest';

const logger = createLogger(SERVICE_NAME);

async function main() {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

  if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
    logger.error('DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID is not set in environment variables.');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  const kafka = new KafkaClient(logger);
  const redis = new RedisClient(logger);

  const commandsService = new CommandsService(rest, logger, redis, DISCORD_CLIENT_ID);
  const interactionsService = new InteractionsService(rest, logger, DISCORD_CLIENT_ID);
  const messagesService = new MessagesService(rest, logger);
  const rolesService = new RolesService(rest, redis, logger);
  const channelsService = new ChannelsService(rest, redis, logger);

  registerConsumers(
    kafka,
    commandsService,
    interactionsService,
    messagesService,
    rolesService,
    channelsService,
  ).catch((error) => {
    logger.error(error, 'Failed to start consumers: ');
    process.exit(1);
  });

  const app = Fastify({
    loggerInstance: logger,
  });

  app.get('/health', async (req, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: SERVICE_NAME,
    };
  });

  // Register routes
  const discordRestRouter = createDiscordRestRouter(
    interactionsService,
    channelsService,
    rolesService,
  );

  app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: discordRestRouter,
    },
  });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3004', 10);
  await app.listen({ host: '0.0.0.0', port: APP_PORT });
  logger.info(`Discord REST service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    logger.info('Shutting down...');
    await app.close();
    await kafka.shutdown();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  logger.error(error, 'Fatal error');
  process.exit(1);
});
