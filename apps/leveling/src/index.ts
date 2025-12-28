import Fastify from 'fastify';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { LevelingService } from './service';
import { registerConsumers } from './consumers';
import { createLevelingRouter } from './router';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { CommandRegistry } from '@cipibot/commands';
import { createCommands } from './commands';
import { LevelingRepository } from './repository';
import { createLogger } from '@cipibot/logger';
import { KafkaClient } from '@cipibot/kafka';
import { RedisClient } from '@cipibot/redis';
import { ConfigClient } from '@cipibot/config-client';

const SERVICE_NAME = 'leveling';
const logger = createLogger(SERVICE_NAME);

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });
  const kafka = new KafkaClient(logger);
  const redis = new RedisClient(logger);
  const configClient = new ConfigClient(redis, logger);

  const levelingRepository = new LevelingRepository(prisma);
  const levelingService = new LevelingService(kafka, logger, levelingRepository, configClient);

  // Register Commands
  const commandsMap = createCommands(levelingService, kafka, configClient, logger);
  const commandNames = Array.from(commandsMap.keys());
  const commandDefinitions = Array.from(commandsMap.values()).map((c) => c.definition);

  logger.info({ commandNames }, `Initialized ${commandNames.length} commands`);

  const commandRegistry = new CommandRegistry(SERVICE_NAME, kafka, redis, logger);

  await commandRegistry.publishDefinitions(commandDefinitions);

  commandRegistry.startHeartbeat(commandNames);

  registerConsumers(kafka, commandRegistry, levelingService, configClient, logger, commandsMap).catch((error) => {
    logger.error(error, 'Failed to start consumers');
    process.exit(1);
  });

  const app = Fastify({
    loggerInstance: logger,
  });

  const levelingRouter = createLevelingRouter(levelingService);

  app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: levelingRouter,
    },
  });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3001', 10);
  await app.listen({ port: APP_PORT });

  logger.info(`Leveling service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    logger.info('Shutting down...');
    commandRegistry.stopHeartbeat();
    await app.close();
    await prisma.$disconnect();
    await kafka.shutdown();
    await redis.shutdown();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  logger.error(error, 'Fatal error:');
  process.exit(1);
});
