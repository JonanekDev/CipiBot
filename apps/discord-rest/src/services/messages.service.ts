import { DiscordAPIError, REST } from '@discordjs/rest';
import {
  APIDMChannel,
  RESTJSONErrorCodes,
  RESTPostAPIChannelMessageJSONBody,
  Routes,
} from 'discord-api-types/v10';
import { Logger } from '@cipibot/logger';

export class MessagesService {
  private readonly logger: Logger;

  constructor(
    private readonly rest: REST,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: 'MessagesService' });
  }

  async sendMessage(channelId: string, body: RESTPostAPIChannelMessageJSONBody): Promise<void> {
    try {
      await this.rest.post(Routes.channelMessages(channelId), {
        body: body,
      });
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        switch (error.code) {
          case RESTJSONErrorCodes.UnknownChannel:
          case RESTJSONErrorCodes.UnknownGuild:
            this.logger.warn({ channelId }, 'Channel/Guild no longer exists, skipping.');
            //TODO: Handle?
            return;
          case RESTJSONErrorCodes.MissingPermissions:
          case RESTJSONErrorCodes.MissingAccess:
            this.logger.warn({ channelId }, `Missing permissions to send message to channel.`);
            return;
          case RESTJSONErrorCodes.CannotSendMessagesToThisUser:
            this.logger.info({ channelId }, `User has DMs closed.`);
            return;
        }
      }
      throw error;
    }
  }

  async sendDirectMessage(userId: string, body: RESTPostAPIChannelMessageJSONBody): Promise<void> {
    // Get DM channel
    try {
      const dmChannel = (await this.rest.post(Routes.userChannels(), {
        body: {
          recipient_id: userId,
        },
      })) as APIDMChannel;
      await this.sendMessage(dmChannel.id, body);
    } catch (error) {
      throw error;
    }
  }
}
