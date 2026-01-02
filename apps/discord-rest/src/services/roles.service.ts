import { Logger } from '@cipibot/logger';
import { REST } from '@discordjs/rest';
import { RESTGetAPIGuildRolesResult, Routes } from 'discord-api-types/v10';
import { safeDiscordRequest } from '../utils/discord';
import { Role } from '@cipibot/schemas/discord';

export class RolesService {
  private readonly logger: Logger;

  constructor(
    private readonly rest: REST,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: 'RolesService' });
  }

  async addRoleToMember(guildId: string, userId: string, roleId: string): Promise<void> {
    await safeDiscordRequest(
      () => this.rest.put(Routes.guildMemberRole(guildId, userId, roleId)),
      this.logger,
      { guildId, userId, roleId },
    );
  }

  async removeRoleFromMember(guildId: string, userId: string, roleId: string): Promise<void> {
    await safeDiscordRequest(
      () => this.rest.delete(Routes.guildMemberRole(guildId, userId, roleId)),
      this.logger,
      { guildId, userId, roleId },
    );
  }

  async getGuildRoles(guildId: string): Promise<Role[]> {
    const roles = (await safeDiscordRequest(
      () => this.rest.get(Routes.guildRoles(guildId)),
      this.logger,
      { guildId },
    )) as Promise<RESTGetAPIGuildRolesResult>;
    return roles;
  }
}
