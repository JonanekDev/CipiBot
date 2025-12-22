import { disconnectConsumers, registerTopicHandler, startConsumer } from '@cipibot/kafka';
import { DiscordRestService } from './service';
import { DiscordMessagePayloadType, RolePayloadType } from '@cipibot/schemas';

const CONSUMER_GROUP = 'discord-rest-service-group';

export async function registerConsumers(discordRestService: DiscordRestService) {
  await registerTopicHandler<DiscordMessagePayloadType>(
    CONSUMER_GROUP,
    'discord.outbound.message.create',
    discordRestService.handleMessageCreate.bind(discordRestService),
  );

  await registerTopicHandler<RolePayloadType>(
    CONSUMER_GROUP,
    'discord.outbound.member.role.add',
    discordRestService.handleMemberRoleAdd.bind(discordRestService),
  );

  await startConsumer(CONSUMER_GROUP);
}

export async function shutdownConsumers() {
  console.log(`Disconnecting Kafka consumer group: ${CONSUMER_GROUP}`);
  await disconnectConsumers(CONSUMER_GROUP);
}
