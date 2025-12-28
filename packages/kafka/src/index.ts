import {
  CompressionTypes,
  Consumer,
  Kafka,
  logLevel,
  Producer,
  type KafkaConfig,
  type EachMessagePayload,
} from 'kafkajs';
import z from 'zod';

type SendEventOptions = {
  key?: string;
  headers?: Record<string, string | Buffer>;
  compression?: CompressionTypes;
};

type SubscribeOptions = {
  fromBeginning?: boolean;
  onError?: (error: unknown) => void;
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

let kafka: Kafka | null = null;
let producer: Producer | null = null;

// Map of groupId -> ConsumerGroup
const consumerGroups = new Map<string, ConsumerGroup>();

function resolveKafkaConfig(): KafkaConfig {
  const envTimeout = parseInt(process.env.KAFKA_CONNECTION_TIMEOUT || '3000', 10);
  const fallbackConnectionTimeout = Number.isFinite(envTimeout) ? envTimeout : 3000;
  return {
    clientId: process.env.KAFKA_CLIENT_ID || 'cipibot',
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    connectionTimeout: fallbackConnectionTimeout,
    logLevel: logLevel.WARN,
    retry: {
      initialRetryTime: parseInt(process.env.KAFKA_RETRY_INITIAL_TIME || '300', 10),
      retries: parseInt(process.env.KAFKA_RETRY_ATTEMPTS || '10', 10),
    },
  };
}

function getKafka(): Kafka {
  if (!kafka) {
    kafka = new Kafka(resolveKafkaConfig());
  }
  return kafka;
}

async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = getKafka().producer();
    await producer.connect();
    console.log('Kafka producer connected');
  }
  return producer;
}

async function getOrCreateConsumerGroup(groupId: string): Promise<ConsumerGroup> {
  const existing = consumerGroups.get(groupId);
  if (existing) {
    return existing;
  }

  const consumer = getKafka().consumer({
    groupId,
    sessionTimeout: 30000,
    rebalanceTimeout: 60000,
    heartbeatInterval: 3000,
    maxWaitTimeInMs: 5000,
  });
  await consumer.connect();
  console.log(`Kafka consumer [${groupId}] connected`);

  const group: ConsumerGroup = {
    consumer,
    handlers: new Map(),
    isRunning: false,
  };
  consumerGroups.set(groupId, group);
  return group;
}

export async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
    console.log('Kafka producer disconnected');
  }
}

export async function disconnectConsumers(groupId?: string): Promise<void> {
  if (groupId) {
    const group = consumerGroups.get(groupId);
    if (group) {
      await group.consumer.disconnect();
      consumerGroups.delete(groupId);
      console.log(`Kafka consumer [${groupId}] disconnected`);
    }
    return;
  }

  await Promise.all(
    Array.from(consumerGroups.entries()).map(async ([id, group]) => {
      await group.consumer.disconnect();
      console.log(`Kafka consumer [${id}] disconnected`);
    }),
  );
  consumerGroups.clear();
}

function serializeHeaders(
  headers?: Record<string, string | Buffer>,
): Record<string, Buffer> | undefined {
  if (!headers) return undefined;
  return Object.entries(headers).reduce<Record<string, Buffer>>((acc, [key, value]) => {
    acc[key] = Buffer.isBuffer(value) ? value : Buffer.from(value);
    return acc;
  }, {});
}

export async function sendEvent(
  topic: string,
  message: object,
  options: SendEventOptions = {},
): Promise<void> {
  const attemptSend = async (prod: Producer) =>
    prod.send({
      topic,
      compression: options.compression,
      messages: [
        {
          key: options.key,
          value: JSON.stringify(message),
          headers: serializeHeaders(options.headers),
        },
      ],
    });

  const currentProducer = await getProducer();
  try {
    await attemptSend(currentProducer);
  } catch (error: unknown) {
    const err = error as { message?: string; name?: string };
    if (err?.message?.includes('disconnected') || err?.name === 'KafkaJSError') {
      console.warn('Kafka producer disconnected, attempting to reconnect...');
      await currentProducer.disconnect().catch(() => {});
      producer = null;
      const reconnected = await getProducer();
      await attemptSend(reconnected);
      return;
    }
    throw error;
  }
}

function safeParseJson<T>(value: Buffer, schema: z.ZodSchema<T>): T {
  const parsed = JSON.parse(value.toString());
  return schema.parse(parsed);
}

/**
 * Register a topic handler for a consumer group.
 * Call this for all topics BEFORE calling startConsumer().
 */
export async function registerTopicHandler<T>(
  groupId: string,
  topic: string,
  schema: z.ZodSchema<T>,
  handler: (data: T, key: string | null) => Promise<void>,
  options: SubscribeOptions = {},
): Promise<void> {
  const group = await getOrCreateConsumerGroup(groupId);

  if (group.isRunning) {
    throw new Error(
      `Cannot register topic "${topic}" - consumer group "${groupId}" is already running. Register all topics before calling startConsumer().`,
    );
  }

  // Subscribe to the topic
  await group.consumer.subscribe({ topic, fromBeginning: options.fromBeginning ?? false });

  // Store the handler
  group.handlers.set(topic, {
    handler: handler as TopicHandler['handler'],
    schema,
    options,
  });

  console.log(`Registered handler for topic "${topic}" in group "${groupId}"`);
}

/**
 * Start the consumer for a group. Call this AFTER registering all topic handlers.
 */
export async function startConsumer(groupId: string): Promise<void> {
  const group = consumerGroups.get(groupId);

  if (!group) {
    throw new Error(
      `Consumer group "${groupId}" not found. Register topics first with registerTopicHandler().`,
    );
  }

  if (group.isRunning) {
    console.log(`Consumer group "${groupId}" is already running`);
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
        console.warn(`No handler for topic "${topic}"`);
        return;
      }

      try {
        const key = message.key ? message.key.toString() : null;
        const data = safeParseJson(message.value, topicHandler.schema);
        await topicHandler.handler(data, key);
      } catch (err) {
        const prefix = `${topic}[${partition} | ${message.offset}]`;
        topicHandler.options.onError?.(err);
        console.error(prefix, 'error handling message', err);
      }
    },
  });

  console.log(`Consumer group "${groupId}" started with ${group.handlers.size} topic(s)`);
}
