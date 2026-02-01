import { WebSocketShardEvents } from '@discordjs/ws';
import { KafkaClient } from '@cipibot/kafka';
import { createManager } from './manager';
import { dispatchEvent } from './events/dispatcher';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { createTRPCClient } from '@trpc/client';
import { DiscordRestRouter } from '@cipibot/discord-rest/router';
import { createLogger } from '@cipibot/logger';
import { CommandRegistry } from '@cipibot/commands';
import { RedisClient } from '@cipibot/redis';
import { ConfigClient } from '@cipibot/config-client';
import Fastify from 'fastify';

const SERVICE_NAME = 'discord-ws';
const logger = createLogger(SERVICE_NAME);

async function main() {
  const manager = createManager();
  const kafka = new KafkaClient(logger);
  const redis = new RedisClient(logger);
  const configClient = new ConfigClient(redis, logger);
  const commandRegistry = new CommandRegistry(SERVICE_NAME, kafka, redis, logger);

  manager.on(WebSocketShardEvents.Ready, () => {
    logger.info('Gateway connection established and ready!');
  });

  const DISCORD_REST_SERVICE_URL =
    process.env.DISCORD_REST_SERVICE_URL || 'http://localhost:3004/trpc';

  const app = Fastify({
    loggerInstance: logger,
  });

  app.get('/health', async (req, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'discord-ws',
    };
  });

  const APP_PORT = parseInt(process.env.PORT || '3001', 10);
  await app.listen({ port: APP_PORT, host: '0.0.0.0' });

  const trpc = createTRPCClient<DiscordRestRouter>({
    links: [
      httpBatchLink({
        url: DISCORD_REST_SERVICE_URL,
      }),
    ],
  });

  manager.on(WebSocketShardEvents.Dispatch, (event) => {
    dispatchEvent(event, trpc, kafka, logger, commandRegistry, configClient);
  });

  await manager.connect();

  // Graceful Shutdown
  const shutdown = async () => {
    logger.info('Shutting down discord-ws...');
    await manager.destroy();
    await kafka.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  logger.error(error, 'Fatal error');
  process.exit(1);
});
