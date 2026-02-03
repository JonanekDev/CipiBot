import { ConfigClient } from '@cipibot/config-client';
import { KafkaClient } from '@cipibot/kafka';
import { Logger } from '@cipibot/logger';

export class TicketingService {
  private kafka: KafkaClient;
  private configClient: ConfigClient;
  private logger: Logger;

  constructor(kafka: KafkaClient, configClient: ConfigClient, logger: Logger) {
    this.kafka = kafka;
    this.configClient = configClient;
    this.logger = logger.child({ module: 'SetupService' });
  }

  createCategory() {
    
  }
}
