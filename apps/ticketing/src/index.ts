import { TicketingService } from './service';
import { registerConsumers } from './consumers';
import { createLogger } from '@cipibot/logger';
import { KafkaClient } from '@cipibot/kafka';
import { ConfigClient } from '@cipibot/config-client';
import { RedisClient } from '@cipibot/redis';
import { createTicketingRouter } from './router';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';

const logger = createLogger('ticketing');

async function main() {
  const kafka = new KafkaClient(logger);
  const redis = new RedisClient(logger);
  const configClient = new ConfigClient(redis, logger);

  const ticketingService = new TicketingService(kafka, configClient, logger);

  registerConsumers(kafka, ticketingService).catch((error) => {
    logger.error(error, 'Failed to start consumers: ');
    process.exit(1);
  });

  const app = Fastify({
    loggerInstance: logger,
  });

  const ticketingRouter = createTicketingRouter(ticketingService);

  app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: ticketingRouter,
    },
  });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3004', 10);
  await app.listen({ port: APP_PORT });

  logger.info(`Ticketing service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    logger.info('Shutting down...');
    await kafka.shutdown();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  logger.error(error, 'Fatal error:');
  process.exit(1);
});