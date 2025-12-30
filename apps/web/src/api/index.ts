import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { ApiRouter } from '@cipibot/api/router';
import type { TRPCClient } from '@trpc/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/trpc';

export const trpc: TRPCClient<ApiRouter> = createTRPCProxyClient<ApiRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
      fetch: async (input, init) => {
        return fetch(input, {
          ...init,
          credentials: 'include',
        });
      },
    }),
  ],
});
