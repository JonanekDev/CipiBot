import { Logger } from '@cipibot/logger';
import Redis, { RedisOptions } from 'ioredis';

export class RedisClient {
  private readonly redis: Redis;
  private readonly logger: Logger;

  constructor(logger: Logger, options?: RedisOptions) {
    this.logger = logger.child({ module: 'RedisClient' });

    const defaultOptions: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      ...options,
    };

    this.redis = new Redis(defaultOptions);
    this.registerEventListeners();
  }

  private registerEventListeners() {
    this.redis.on('connect', () => {
      this.logger.info('Connected to Redis server');
    });

    this.redis.on('ready', () => {
      this.logger.info('Redis connection is ready');
    });

    this.redis.on('reconnecting', (time: number) => {
      this.logger.warn({ time }, 'Reconnecting to Redis server');
    });

    this.redis.on('error', (error) => {
      this.logger.error({ error }, 'Redis connection error');
    });
  }

  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Redis client');
    await this.redis.quit();
  }

  async get(key: string, mode?: 'EX', duration?: number): Promise<string | null> {
    try {
      if (mode && duration) {
        return await this.redis.getex(key, mode, duration);
      }
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error({ key, error }, 'Redis GET failed');
      throw error;
    }
  }

  async set(key: string, value: string, mode?: 'EX', duration?: number): Promise<'OK'> {
    try {
      if (mode && duration) {
        return await this.redis.set(key, value, mode, duration);
      }
      return await this.redis.set(key, value);
    } catch (error) {
      this.logger.error({ key, value, error }, 'Redis SET failed');
      throw error;
    }
  }

  async hset(key: string, field: string | object, value?: string): Promise<number> {
    try {
      if (typeof field === 'object') {
        return await this.redis.hset(key, field);
      }
      if (value === undefined) {
        throw new Error('Value must be provided when field is a string');
      }
      return await this.redis.hset(key, field, value);
    } catch (error) {
      this.logger.error({ key, field, error }, 'Redis HSET failed');
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redis.hgetall(key);
    } catch (error) {
      this.logger.error({ key, error }, 'Redis HGETALL failed');
      throw error;
    }
  }
}
