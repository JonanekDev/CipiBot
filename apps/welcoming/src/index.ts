import { WelcomingService } from './service';
import { registerConsumers } from './consumers';
import { createLogger } from '@cipibot/logger';
import { KafkaClient } from '@cipibot/kafka';
import { ConfigClient } from '@cipibot/config-client';
import { RedisClient } from '@cipibot/redis';
import Fastify from 'fastify';

const SERVICE_NAME = 'welcoming';

const logger = createLogger(SERVICE_NAME);

async function main() {
  const kafka = new KafkaClient(logger);
  const redis = new RedisClient(logger);
  const configClient = new ConfigClient(redis, logger);

  const welcomingService = new WelcomingService(kafka, configClient);

  registerConsumers(kafka, welcomingService).catch((error) => {
    logger.error(error, 'Failed to start consumers: ');
    process.exit(1);
  });

  const app = Fastify({
    loggerInstance: logger,
  });

  app.get('/health', async (req, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: SERVICE_NAME,
    };
  });

  const APP_PORT = parseInt(process.env.PORT || '3006', 10);
  await app.listen({ port: APP_PORT, host: '0.0.0.0' });

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
