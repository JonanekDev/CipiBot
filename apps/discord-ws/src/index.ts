import { WebSocketShardEvents } from '@discordjs/ws';
import { disconnectProducer } from '@cipibot/kafka';
import { createManager } from './manager';
import { dispatchEvent } from './events/dispatcher';

async function main() {
  const manager = createManager();

  manager.on(WebSocketShardEvents.Ready, () => {
    console.log('Gateway connection established and ready!');
  });

  manager.on(WebSocketShardEvents.Dispatch, (event) => {
    dispatchEvent(event);
  });

  await manager.connect();

  // Graceful Shutdown
  const shutdown = async () => {
    console.log('Shutting down discord-ws...');
    await manager.destroy();
    await disconnectProducer();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(console.error);
