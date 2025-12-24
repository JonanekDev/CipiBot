import { DiscordInteractionReplyType } from '@cipibot/schemas';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';

// 10062 (Unknown interaction) and 40060 (Already acknowledged)
export class InteractionsService {
  constructor(
    private rest: REST,
    private applicationId: string,
  ) {
    this.rest = rest;
  }

  async deferCommandResponse(interactionId: string, interactionToken: string): Promise<void> {
    try {
      await this.rest.post(Routes.interactionCallback(interactionId, interactionToken), {
        body: {
          type: 5,
        },
      });
    } catch (error: any) {
      if (error.code !== 10062 && error.code !== 40060) {
        console.warn(`Failed to defer interaction ${interactionId}:`, error);
      }
    }
  }

  async sendReply(payload: DiscordInteractionReplyType): Promise<void> {
    try {
      await this.rest.post(
        Routes.interactionCallback(payload.interactionId, payload.interactionToken),
        {
          body: {
            type: 4,
            data: payload.body,
          },
        },
      );
    } catch (error: any) {
      if (error.code === 40060 || error.code === 10062) {
        await this.rest.patch(
          Routes.webhookMessage(this.applicationId, payload.interactionToken, '@original'),
          {
            body: payload.body,
          },
        );
      } else {
        throw error;
      }
    }
  }
}
