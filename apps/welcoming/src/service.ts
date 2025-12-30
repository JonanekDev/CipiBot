import { ConfigClient } from '@cipibot/config-client';
import { DiscordDMPayloadType, DiscordMessagePayloadType } from '@cipibot/schemas';
import { createUserVariables } from '@cipibot/templating/modules/common';
import { renderDiscordMessage } from '@cipibot/embeds/discord';
import { KafkaClient } from '@cipibot/kafka';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { t } from '@cipibot/i18n';

export class WelcomingService {
  private kafka: KafkaClient;
  private configClient: ConfigClient;

  constructor(kafka: KafkaClient, configClient: ConfigClient) {
    this.kafka = kafka;
    this.configClient = configClient;
  }

  async welcomeMessage(
    guildId: string,
    userId: string,
    username: string,
    avatar: string | null,
    globalName: string | null,
  ) {
    const config = await this.configClient.getGuildConfig(guildId);
    if (!config.welcoming.enabled || !config.welcoming.welcomeEnabled) return;

    const usersVariables = createUserVariables({
      userId: userId,
      username: globalName ?? username,
      avatar: avatar,
    });

    if (config.welcoming.dmWelcomeMessage) {
      let dmEventData: DiscordDMPayloadType = {
        userId: userId,
        body: {},
      };
      dmEventData.body = renderDiscordMessage(config.welcoming.dmWelcomeMessage, usersVariables);
      this.kafka.sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_DM, dmEventData);
    }

    if (!config.welcoming.channelId) return; //TODO: Something?

    let eventData: DiscordMessagePayloadType = {
      channelId: config.welcoming.channelId,
      body: {},
    };

    eventData.body = renderDiscordMessage(config.welcoming.welcomeMessage, usersVariables, {
      title: t(config.language, 'welcoming.welcomeTitle'),
      description: t(config.language, 'welcoming.welcomeDescription'),
      thumbnail: { url: `{{avatarUrl}}` },
    });
    this.kafka.sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_MESSAGE, eventData);
  }

  async leaveMessage(
    guildId: string,
    userId: string,
    username: string,
    avatar: string | null,
    globalName: string | null,
  ) {
    const config = await this.configClient.getGuildConfig(guildId);
    if (!config.welcoming.enabled || !config.welcoming.leaveEnabled) return;
    if (!config.welcoming.channelId) return;
    const usersVariables = createUserVariables({
      userId: userId,
      username: globalName ?? username,
      avatar: avatar,
    });

    let eventData: DiscordMessagePayloadType = {
      channelId: config.welcoming.channelId,
      body: {},
    };
    eventData.body = renderDiscordMessage(config.welcoming.leaveMessage, usersVariables, {
      title: t(config.language, 'welcoming.leaveTitle'),
      description: t(config.language, 'welcoming.leaveDescription'),
      thumbnail: { url: `{{avatarUrl}}` },
    });
    this.kafka.sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_MESSAGE, eventData);
  }
}
