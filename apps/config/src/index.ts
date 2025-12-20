import Fastify from 'fastify';
import { PrismaClient } from './generated/prisma/client';
import { getRedis } from '@cipibot/redis';
import { registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { registerConfigRoutes } from './routes';
import { ConfigService } from './service';
import { PrismaPg } from '@prisma/adapter-pg';
import { APIGuild } from 'discord-api-types/v10';
import { registerConsumers, shutdownConsumers } from './consumers';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });
  const redis = getRedis();
  const configService = new ConfigService(prisma, redis);

  registerConsumers(configService).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });

  const app = Fastify({
    logger: true,
  });

  // Register routes
  await registerConfigRoutes(app, configService);

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3000', 10);
  await app.listen({ port: APP_PORT });

  console.log(`Config service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    console.log('Shutting down...');
    await app.close();
    await prisma.$disconnect();
    await redis.quit();
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
