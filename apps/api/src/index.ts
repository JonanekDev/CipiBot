import { getRedis } from "@cipibot/redis";
import Fastify from "fastify";
import { registerAPIRoutes } from "./routes";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CONFIG } from "./config";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";

async function main() {
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' });

  const prisma = new PrismaClient({ adapter });

  const redis = getRedis();
  const authService = new AuthService(prisma, redis);

  const app = Fastify({
    logger: true,
  });

  // For zod validation
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const zodApp = app.withTypeProvider<ZodTypeProvider>();

  app.register(fastifyCookie, {
    hook: 'onRequest',
  });
  app.register(fastifyJwt, {
    secret: CONFIG.JWT_SECRET,
    cookie: {
        cookieName: 'access_token',
        signed: false
    }
  })

  // Register routes
  await registerAPIRoutes(zodApp, { authController: new AuthController(authService) });

  // Start server
  const APP_PORT = parseInt(process.env.PORT || '3002', 10);
  await app.listen({ port: APP_PORT });

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

