import { Logger } from '@cipibot/logger';
import { DiscordAPIError, REST } from '@discordjs/rest';
import { RESTJSONErrorCodes, Routes } from 'discord-api-types/rest/v10';
import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v9';
import { safeDiscordRequest } from '../utils/discord';

// 10062 (Unknown interaction) and 40060 (Already acknowledged)
export class InteractionsService {
  private readonly logger: Logger;

  constructor(
    private readonly rest: REST,
    logger: Logger,
    private readonly applicationId: string,
  ) {
    this.logger = logger.child({ module: 'InteractionsService' });
  }

  async deferCommandResponse(
    interactionId: string,
    interactionToken: string,
    ephemeral: boolean,
  ): Promise<void> {
    try {
      await this.rest.post(Routes.interactionCallback(interactionId, interactionToken), {
        body: {
          type: 5,
          data: {
            flags: ephemeral ? 64 : undefined,
          },
        },
      });
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        switch (error.code) {
          case RESTJSONErrorCodes.UnknownInteraction:
            this.logger.warn(
              `Interaction ${interactionId} is unknown (possibly timed out), cannot defer.`,
            );
            return;
          case RESTJSONErrorCodes.InteractionHasAlreadyBeenAcknowledged:
            this.logger.warn(
              `Interaction ${interactionId} has already been acknowledged, cannot defer.`,
            );
            return;
        }
      }
      throw error;
    }
  }

  //Direct reply to interaction without deferring
  async sendReply(
    interactionId: string,
    interactionToken: string,
    body: RESTPostAPIChannelMessageJSONBody,
    ephemeral: boolean,
  ): Promise<void> {
      await safeDiscordRequest(() => this.rest.post(Routes.interactionCallback(interactionId, interactionToken), {
        body: {
          type: 4,
          data: {
            ...body,
            flags: ephemeral ? 64 : undefined,
          },
        },
      }), this.logger, { interactionId, interactionToken });
  }

  //Reply after deferring
  async updateReply(
    interactionId: string,
    interactionToken: string,
    body: RESTPostAPIChannelMessageJSONBody,
  ): Promise<void> {
      await safeDiscordRequest(() => this.rest.patch(
        Routes.webhookMessage(this.applicationId, interactionToken, '@original'),
        {
          body: body,
        },
      ), this.logger, { interactionId, interactionToken });
  }
}
