import {
  CompressionTypes,
  Consumer,
  Kafka,
  logLevel,
  Producer,
  type EachMessagePayload,
  LogEntry,
} from 'kafkajs';
import z from 'zod';
import type { Logger } from '@cipibot/logger';

export type SendEventOptions = {
  key?: string;
  headers?: Record<string, string | Buffer>;
  compression?: CompressionTypes;
};

export type SubscribeOptions = {
  fromBeginning?: boolean;
};

type TopicHandler<T = unknown> = {
  handler: (data: T, key: string | null) => Promise<void>;
  schema: z.ZodSchema<T>;
  options: SubscribeOptions;
};

type ConsumerGroup = {
  consumer: Consumer;
  handlers: Map<string, TopicHandler>;
  isRunning: boolean;
};

export class KafkaClient {
  private kafka: Kafka;
  private logger: Logger;
  private producer: Producer | null = null;
  private consumerGroups = new Map<string, ConsumerGroup>();
  private clientId: string;
  private brokers: string[];

  constructor(logger: Logger, clientId?: string, brokers?: string[]) {
    this.logger = logger.child({ package: 'KafkaClient' });
    this.clientId = clientId || process.env.KAFKA_CLIENT_ID || 'cipibot';

    // Debug: log environment variable
    this.logger.info(
      {
        KAFKA_BROKERS_env: process.env.KAFKA_BROKERS,
        brokers_param: brokers,
      },
      'KafkaClient constructor debug',
    );

    this.brokers =
      brokers && brokers.length > 0
        ? brokers
        : process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

    this.logger.info({ brokers: this.brokers }, 'KafkaClient initialized with brokers');

    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
      connectionTimeout: parseInt(process.env.KAFKA_CONNECTION_TIMEOUT || '3000', 10),
      logLevel: logLevel.INFO,
      logCreator: this.createLogBridge,
      retry: {
        initialRetryTime: parseInt(process.env.KAFKA_RETRY_INITIAL_TIME || '300', 10),
        retries: parseInt(process.env.KAFKA_RETRY_ATTEMPTS || '10', 10),
      },
    });
  }

  //Bridge between KafkaJS internal logs and our Pino logger
  private createLogBridge = (level: logLevel) => {
    return ({ log }: LogEntry) => {
      const { message, ...extra } = log;
      const logData = { ...extra, kafkaNamespace: log.namespace };

      switch (level) {
        case logLevel.ERROR:
        case logLevel.NOTHING:
          this.logger.error(logData, message);
          break;
        case logLevel.WARN:
          this.logger.warn(logData, message);
          break;
        case logLevel.INFO:
          this.logger.info(logData, message);
          break;
        case logLevel.DEBUG:
          this.logger.debug(logData, message);
          break;
      }
    };
  };

  private async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      this.logger.info({ brokers: this.brokers }, 'Kafka producer connected');
    }
    return this.producer;
  }

  async sendEvent(topic: string, message: object, options: SendEventOptions = {}): Promise<void> {
    const attemptSend = async (prod: Producer) =>
      prod.send({
        topic,
        compression: options.compression,
        messages: [
          {
            key: options.key,
            value: JSON.stringify(message),
            headers: this.serializeHeaders(options.headers),
          },
        ],
      });

    const currentProducer = await this.getProducer();
    try {
      await attemptSend(currentProducer);
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string };
      if (err?.message?.includes('disconnected') || err?.name === 'KafkaJSError') {
        this.logger.warn('Kafka producer disconnected, attempting to reconnect...');
        try {
          await currentProducer.disconnect();
        } catch {
          // Ignore disconnect error
        }
        this.producer = null;
        const reconnected = await this.getProducer();
        await attemptSend(reconnected);
        return;
      }
      throw error;
    }
  }

  async registerHandler<T>(
    groupId: string,
    topic: string,
    schema: z.ZodSchema<T>,
    handler: (data: T, key: string | null) => Promise<void>,
    options: SubscribeOptions = {},
  ): Promise<void> {
    const group = await this.getOrCreateConsumerGroup(groupId);

    if (group.isRunning) {
      throw new Error(
        `Cannot register topic "${topic}" - consumer group "${groupId}" is already running. Register all topics before calling startConsumer().`,
      );
    }

    await group.consumer.subscribe({
      topic,
      fromBeginning: options.fromBeginning ?? false,
    });

    group.handlers.set(topic, {
      handler: handler as TopicHandler['handler'],
      schema,
      options,
    });

    this.logger.info({ groupId, topic }, `Registered Kafka handler`);
  }

  async startConsumer(groupId: string): Promise<void> {
    const group = this.consumerGroups.get(groupId);

    if (!group) {
      throw new Error(
        `Consumer group "${groupId}" not found. Register topics first with registerHandler().`,
      );
    }

    if (group.isRunning) {
      this.logger.warn({ groupId }, 'Consumer group is already running');
      return;
    }

    if (group.handlers.size === 0) {
      throw new Error(`No handlers registered for consumer group "${groupId}"`);
    }

    group.isRunning = true;

    await group.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;
        if (!message.value) return;

        const topicHandler = group.handlers.get(topic);
        if (!topicHandler) {
          // Shouldn't happen
          return;
        }

        const logContext = { topic, partition, offset: message.offset };

        try {
          const key = message.key ? message.key.toString() : null;
          const data = this.safeParseJson(message.value, topicHandler.schema);

          await topicHandler.handler(data, key);
        } catch (err) {
          this.logger.error({ ...logContext, err }, 'Error handling Kafka message');
        }
      },
    });

    this.logger.info({ groupId, topicCount: group.handlers.size }, 'Kafka consumer group started');
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Kafka client...');

    // Disconnect all consumers
    await Promise.all(
      Array.from(this.consumerGroups.entries()).map(async ([groupId, group]) => {
        await group.consumer.disconnect();
        this.logger.info({ groupId }, 'Kafka consumer disconnected');
      }),
    );
    this.consumerGroups.clear();

    // Disconnect producer
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
      this.logger.info('Kafka producer disconnected');
    }
  }

  private async getOrCreateConsumerGroup(groupId: string): Promise<ConsumerGroup> {
    const existing = this.consumerGroups.get(groupId);
    if (existing) {
      return existing;
    }

    const consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000,
      maxWaitTimeInMs: 5000,
    });

    await consumer.connect();
    this.logger.info({ groupId }, 'Kafka consumer connected');

    const group: ConsumerGroup = {
      consumer,
      handlers: new Map(),
      isRunning: false,
    };
    this.consumerGroups.set(groupId, group);
    return group;
  }

  private serializeHeaders(
    headers?: Record<string, string | Buffer>,
  ): Record<string, Buffer> | undefined {
    if (!headers) return undefined;
    return Object.entries(headers).reduce<Record<string, Buffer>>((acc, [key, value]) => {
      acc[key] = Buffer.isBuffer(value) ? value : Buffer.from(value);
      return acc;
    }, {});
  }

  private safeParseJson<T>(value: Buffer, schema: z.ZodSchema<T>): T {
    const parsed = JSON.parse(value.toString());
    return schema.parse(parsed);
  }
}
