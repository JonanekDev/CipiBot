import { WebSocketShardEvents } from '@discordjs/ws';
import { disconnectProducer } from '@cipibot/kafka';
import { createManager } from './manager';
import { dispatchEvent } from './events/dispatcher';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { createTRPCClient } from '@trpc/client';
import { DiscordRestRouter } from '@cipibot/discord-rest/router';

async function main() {
  const manager = createManager();

  manager.on(WebSocketShardEvents.Ready, () => {
    console.log('Gateway connection established and ready!');
  });

  const DISCORD_REST_SERVICE_URL =
    process.env.DISCORD_REST_SERVICE_URL || 'http://localhost:3003/trpc';

  const trpc = createTRPCClient<DiscordRestRouter>({
    links: [
      httpBatchLink({
        url: DISCORD_REST_SERVICE_URL,
      }),
    ],
  });

  manager.on(WebSocketShardEvents.Dispatch, (event) => {
    dispatchEvent(event, trpc);
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
