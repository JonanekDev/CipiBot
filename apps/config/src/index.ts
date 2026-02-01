import Fastify from 'fastify';
import { PrismaClient } from './generated/prisma/client';
import { RedisClient } from '@cipibot/redis';
import { ConfigService } from './service';
import { PrismaPg } from '@prisma/adapter-pg';
import { registerConsumers } from './consumers';
import { createConfigRouter } from './router';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { ConfigRepository } from './repository';
import { KafkaClient } from '@cipibot/kafka';
import { createLogger } from '@cipibot/logger';

const logger = createLogger('config');

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });
  const redis = new RedisClient(logger);
  const kafka = new KafkaClient(logger);

  const configRepository = new ConfigRepository(prisma);
  const configService = new ConfigService(redis, configRepository);

  registerConsumers(configService, kafka).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });

  const app = Fastify({
    loggerInstance: logger,
  });

  // Register routes
  const configRouter = createConfigRouter(configService);

  app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: configRouter,
    },
  });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3000', 10);
  await app.listen({ port: APP_PORT, host: '0.0.0.0' });

  logger.info(`Config service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    logger.info('Shutting down...');
    await app.close();
    await prisma.$disconnect();
    await redis.shutdown();
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
