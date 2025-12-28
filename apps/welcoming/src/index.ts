import { WelcomingService } from './service';
import { registerConsumers, shutdownConsumers } from './consumers';

async function main() {
  const welcomingService = new WelcomingService();

  registerConsumers(welcomingService).catch((error) => {
    console.error('Failed to start consumers: ', error);
    process.exit(1);
  });

  const shutdown = async () => {
    console.log('Shutting down...');
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
