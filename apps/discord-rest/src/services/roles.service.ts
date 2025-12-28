import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

export class RolesService {
  constructor(private readonly rest: REST) {}

  async addRoleToMember(guildId: string, userId: string, roleId: string): Promise<void> {
    await this.rest.put(Routes.guildMemberRole(guildId, userId, roleId));
  }

  async removeRoleFromMember(guildId: string, userId: string, roleId: string): Promise<void> {
    await this.rest.delete(Routes.guildMemberRole(guildId, userId, roleId));
  }
}
