import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v10';
import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v9';

// 10062 (Unknown interaction) and 40060 (Already acknowledged)
export class InteractionsService {
  constructor(
    private readonly rest: REST,
    private readonly applicationId: string,
  ) {}

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
    } catch (error: any) {
      if (error.code !== 10062 && error.code !== 40060) {
        console.warn(`Failed to defer interaction ${interactionId}:`, error);
      }
    }
  }

  //Direct reply to interaction without deferring
  async sendReply(
    interactionId: string,
    interactionToken: string,
    body: RESTPostAPIChannelMessageJSONBody,
    ephemeral: boolean,
  ): Promise<void> {
    try {
      await this.rest.post(Routes.interactionCallback(interactionId, interactionToken), {
        body: {
          type: 4,
          data: {
            ...body,
            flags: ephemeral ? 64 : undefined,
          },
        },
      });
    } catch (error: any) {
      console.error(`Failed to send reply for interaction ${interactionId}:`, error);
    }
  }

  //Reply after deferring
  async updateReply(
    interactionId: string,
    interactionToken: string,
    body: RESTPostAPIChannelMessageJSONBody,
  ): Promise<void> {
    try {
      await this.rest.patch(
        Routes.webhookMessage(this.applicationId, interactionToken, '@original'),
        {
          body: body,
        },
      );
    } catch (error: any) {
      console.error(`Failed to update reply for interaction ${interactionId}:`, error);
    }
  }
}
