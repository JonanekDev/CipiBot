import { DiscordMessagePayloadType, RolePayloadType } from '@cipibot/schemas';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

export class DiscordRestService {
  private rest: REST;

  constructor(token: string) {
    this.rest = new REST({ version: '10' }).setToken(token);
  }

  async handleMessageCreate(payload: DiscordMessagePayloadType): Promise<void> {
    await this.rest.post(Routes.channelMessages(payload.channelId), {
      body: payload.body,
    });
  }

  async handleMemberRoleAdd(payload: RolePayloadType): Promise<void> {
    await this.rest.put(
      Routes.guildMemberRole(payload.guildId, payload.userId, payload.roleId),
    );
  }
}
