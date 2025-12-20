import Redis from 'ioredis';

let instance: Redis | null = null;

export function getRedis(): Redis {
  if (!instance) {
    instance = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    });
    console.log('Redis client connected');
  }
  return instance;
}

export type { Redis };
