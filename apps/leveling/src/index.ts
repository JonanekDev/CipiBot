import { registerConsumers, shutdownConsumers } from './consumers';
import { LevelingService } from './service';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import Fastify from 'fastify';
import { registerLevelingRoutes } from './routes';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });
  const levelingService = new LevelingService(prisma);

  registerConsumers(levelingService).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });

  const app = Fastify({
    logger: true,
  });

  // Register routes
  await registerLevelingRoutes(app, levelingService);

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3001', 10);
  await app.listen({ port: APP_PORT });

  console.log(`Config service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    console.log('Shutting down...');
    await prisma.$disconnect();
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
