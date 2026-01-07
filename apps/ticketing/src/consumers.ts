import { KafkaClient } from '@cipibot/kafka';
import { TicketingService } from './service';
import { KAFKA_TOPICS } from '@cipibot/constants';

const CONSUMER_GROUP = 'ticketing-service-group';

export async function registerConsumers(kafka: KafkaClient, ticketingService: TicketingService) {
  await kafka.startConsumer(CONSUMER_GROUP);
}
