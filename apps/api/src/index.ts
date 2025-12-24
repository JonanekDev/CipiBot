import { getRedis } from '@cipibot/redis';
import Fastify from 'fastify';
import { AuthService } from './services/auth.service';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { CONFIG } from './config';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from './context';
import { createAppRouter } from './router';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });

  const redis = getRedis();
  const authService = new AuthService(prisma, redis);

  const app = Fastify({
    logger: true,
  });

  app.register(fastifyCookie);

  app.register(fastifyJwt, {
    secret: CONFIG.JWT_SECRET,
    cookie: {
      cookieName: 'access_token',
      signed: false,
    },
  });

  const appRouter = createAppRouter(authService);

  app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3002', 10);
  await app.listen({ port: APP_PORT, host: '0.0.0.0' });

  console.log(`API service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    console.log('Shutting down...');
    await app.close();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
