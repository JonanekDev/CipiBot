import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import type { FastifyRequest, FastifyReply } from 'fastify';

export interface Context {
  req: FastifyRequest;
  res: FastifyReply;
}

export function createContext({ req, res }: CreateFastifyContextOptions): Context {
  return { req, res };
}
