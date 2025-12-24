import Fastify from 'fastify';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { LevelingService } from './service';
import { registerConsumers, shutdownConsumers } from './consumers';
import { createLevelingRouter } from './router';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { startCommandHeartbeat, publishCommandDefinitions } from '@cipibot/commands';
import { createCommands } from './commands';

const SERVICE_NAME = 'leveling';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });
  const levelingService = new LevelingService(prisma);

  // Register Commands
  const commandsMap = createCommands(levelingService);
  const commandNames = Array.from(commandsMap.keys());
  const commandDefinitions = Array.from(commandsMap.values()).map((c) => c.definition);

  console.log(`Initialized ${commandNames.length} commands: ${commandNames.join(', ')}`);

  await publishCommandDefinitions(SERVICE_NAME, commandDefinitions);

  const stopHeartbeat = startCommandHeartbeat(SERVICE_NAME, commandNames);

  registerConsumers(levelingService, commandsMap).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });

  const app = Fastify({
    logger: true,
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

  console.log(`Leveling service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    console.log('Shutting down...');
    stopHeartbeat();
    await app.close();
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
