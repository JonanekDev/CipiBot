import { GuildChannel } from '@cipibot/schemas';
import { REST } from '@discordjs/rest';
import { RESTGetAPIGuildChannelsResult, Routes } from 'discord-api-types/v10';
import { safeDiscordRequest } from '../utils/discord';
import { Logger } from '@cipibot/logger';

export class ChannelsService {
  private readonly logger: Logger;
  constructor(
    private readonly rest: REST,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: 'ChannelsService' });
  }

  async getGuildChannels(guildId: string): Promise<GuildChannel[]> {
    const channels = (await safeDiscordRequest(
      () => this.rest.get(Routes.guildChannels(guildId)),
      this.logger,
      { guildId },
    )) as RESTGetAPIGuildChannelsResult;
    return channels;
  }
}
