import { registerConsumers, shutdownConsumers } from './consumers';
import { LevelingService } from './service';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });
  const levelingService = new LevelingService(prisma);

  registerConsumers(levelingService).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });

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
