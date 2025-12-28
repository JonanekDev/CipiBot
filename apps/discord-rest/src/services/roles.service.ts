import { Logger } from '@cipibot/logger';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { safeDiscordRequest } from '../utils/discord';

export class RolesService {
  private readonly logger: Logger;


  constructor(private readonly rest: REST, logger: Logger) {
    this.logger = logger.child({ module: 'RolesService' });
  }

  async addRoleToMember(guildId: string, userId: string, roleId: string): Promise<void> {
    await safeDiscordRequest(() => this.rest.put(Routes.guildMemberRole(guildId, userId, roleId)), this.logger, { guildId, userId, roleId });
  }

  async removeRoleFromMember(guildId: string, userId: string, roleId: string): Promise<void> {
    await safeDiscordRequest(() => this.rest.delete(Routes.guildMemberRole(guildId, userId, roleId)), this.logger, { guildId, userId, roleId });
  }
}
