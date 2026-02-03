import { REST } from '@discordjs/rest';
import {
  ChannelType,
  RESTPostAPIGuildChannelJSONBody,
  RESTPostAPIGuildChannelResult,
  Routes,
} from 'discord-api-types/v10';
import { Logger } from '@cipibot/logger';
import { safeDiscordRequest } from '../utils/discord';

export class CategoriesService {
  private readonly logger: Logger;

  constructor(
    private readonly rest: REST,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: 'CategoriesService' });
  }

  async createCategory(guildId: string, name: string): Promise<RESTPostAPIGuildChannelResult> {
    this.logger.info({ guildId, name }, 'Creating category');

    const body: RESTPostAPIGuildChannelJSONBody = {
      name,
      type: ChannelType.GuildCategory,
    };

    const category = (await safeDiscordRequest(
      () => this.rest.post(Routes.guildChannels(guildId), { body }),
      this.logger,
      { guildId, name },
    )) as RESTPostAPIGuildChannelResult;

    this.logger.info({ guildId, categoryId: category.id, name }, 'Category created');
    return category;
  }
}
