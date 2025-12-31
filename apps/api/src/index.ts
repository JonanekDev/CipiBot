import { RedisClient } from '@cipibot/redis';
import Fastify, { FastifyError } from 'fastify';
import { ErrorRes } from '@cipibot/schemas/api';
import { ZodError } from 'zod';
import { AuthService } from './services/auth.service';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { CONFIG } from './config';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from './context';
import { createAppRouter } from './router';
import { createLogger } from '@cipibot/logger';
import { ConfigClient } from '@cipibot/config-client';
import cors from '@fastify/cors';

const logger = createLogger('api');

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });

  const redis = new RedisClient(logger);
  const configClient = new ConfigClient(redis, logger);

  const authService = new AuthService(prisma, redis, logger, configClient);

  const app = Fastify({
    loggerInstance: logger,
  });

  await app.register(cors, {
    origin: ['http://localhost:5174', 'https://cipibot.scipak.eu'],
    credentials: true,
  });

  await app.register(fastifyCookie);

  await app.register(fastifyJwt, {
    secret: CONFIG.JWT_SECRET,
    cookie: {
      cookieName: 'access_token',
      signed: false,
    },
  });

  const appRouter = createAppRouter(authService);

  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3002', 10);
  await app.listen({ port: APP_PORT, host: '0.0.0.0' });

  logger.info(`API service listening on port ${APP_PORT}`);

  const shutdown = async () => {
    logger.info('Shutting down...');
    await app.close();
    await prisma.$disconnect();
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
