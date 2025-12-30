import { WelcomingService } from './service';
import { registerConsumers } from './consumers';
import { createLogger } from '@cipibot/logger';
import { KafkaClient } from '@cipibot/kafka';
import { ConfigClient } from '@cipibot/config-client';
import { RedisClient } from '@cipibot/redis';

const logger = createLogger('welcoming');

async function main() {
  const kafka = new KafkaClient(logger);
  const redis = new RedisClient(logger);
  const configClient = new ConfigClient(redis, logger);

  const welcomingService = new WelcomingService(kafka, configClient);

  registerConsumers(kafka, welcomingService).catch((error) => {
    logger.error(error, 'Failed to start consumers: ');
    process.exit(1);
  });

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
