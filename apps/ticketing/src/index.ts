import { TicketingService } from './service';
import { registerConsumers } from './consumers';
import { createLogger } from '@cipibot/logger';
import { KafkaClient } from '@cipibot/kafka';
import { ConfigClient } from '@cipibot/config-client';
import { RedisClient } from '@cipibot/redis';
import { createTicketingRouter } from './router';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const SERVICE_NAME = 'ticketing';
const logger = createLogger(SERVICE_NAME);

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });
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

  app.get('/health', async (req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: SERVICE_NAME,
      };
    } catch (error) {
      app.log.error(error);
      return reply.status(503).send({
        status: 'error',
        service: SERVICE_NAME,
        message: 'Database connection failed',
      });
    }
  });

  const ticketingRouter = createTicketingRouter(ticketingService);

  app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: ticketingRouter,
    },
  });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3007', 10);
  await app.listen({ port: APP_PORT, host: '0.0.0.0' });

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
