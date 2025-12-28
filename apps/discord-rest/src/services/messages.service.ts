import { REST } from '@discordjs/rest';
import { APIDMChannel, RESTPostAPIChannelMessageJSONBody, Routes } from 'discord-api-types/v10';

export class MessagesService {
  constructor(private readonly rest: REST) {}

  async sendMessage(channelId: string, body: RESTPostAPIChannelMessageJSONBody): Promise<void> {
    await this.rest
      .post(Routes.channelMessages(channelId), {
        body: body,
      })
      .catch((error) => {
        console.error(`Failed to send message to channel ${channelId}:`, error);
        throw error;
      });
  }

  async sendDirectMessage(userId: string, body: RESTPostAPIChannelMessageJSONBody): Promise<void> {
    // Get DM channel
    const dmChannel = (await this.rest.post(Routes.userChannels(), {
      body: {
        recipient_id: userId,
      },
    })) as APIDMChannel;

    await this.sendMessage(dmChannel.id, body);
  }
}
