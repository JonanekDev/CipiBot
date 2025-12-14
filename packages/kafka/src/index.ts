import { Kafka, logLevel, Producer } from 'kafkajs';

let kafka: Kafka | null = null;
let producer: Producer | null = null;

function getKafka(): Kafka {
  if (!kafka) {
    const connectionTimeout = parseInt(process.env.KAFKA_CONNECTION_TIMEOUT || '3000', 10);
    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'cipibot',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      connectionTimeout: isNaN(connectionTimeout) ? 3000 : connectionTimeout,
      logLevel: logLevel.INFO,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });
  }
  return kafka;
}

async function getProducer() {
  if (!producer) {
    producer = getKafka().producer();
    await producer.connect();
    console.log('Kafka producer connected');
  }
  return producer;
}

export async function sendEvent(topic: string, message: object, key?: string) {
  const prod = await getProducer();
  await prod.send({
    topic,
    messages: [
      {
        key,
        value: JSON.stringify(message),
      },
    ],
  });
}

export async function subscribeToTopic<T>(
  groupId: string,
  topic: string,
  handler: (data: T, key: string | null) => Promise<void>,
) {
  const consumer = getKafka().consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${groupId}`;

      if (!message.value) return;

      try {
        const parsedMessage = JSON.parse(message.value.toString()) as T;
        const key = message.key ? message.key.toString() : null;
        await handler(parsedMessage, key);
      } catch (err) {
        console.error(prefix, 'error handling message', err);
      }
    },
  });
}
