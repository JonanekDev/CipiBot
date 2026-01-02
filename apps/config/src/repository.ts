import { Guild, PrismaClient } from './generated/prisma/client';
import { type GuildConfigPatchType } from '@cipibot/schemas';

export class ConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getGuild(guildId: string): Promise<Guild | null> {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
    });
    return guild;
  }

  async updateGuildConfig(guildId: string, config: object) {
    const guild = await this.prisma.guild.update({
      where: { id: guildId },
      data: { config },
    });
    return guild.config;
  }

  async upsertGuild(
    guildId: string,
    name: string,
    icon: string | null,
    guildConfig: GuildConfigPatchType,
  ): Promise<Guild> {
    return await this.prisma.guild.upsert({
      where: { id: guildId },
      create: { id: guildId, name, icon, config: guildConfig },
      update: { name, icon, removed: false },
    });
  }

  async filterKnownGuilds(guildIds: string[]): Promise<string[]> {
    const knownGuilds = await this.prisma.guild.findMany({
      where: {
        id: { in: guildIds },
        removed: false,
      },
      select: { id: true },
    });
    return knownGuilds.map((guild) => guild.id);
  }

  async guildRemove(guildId: string): Promise<void> {
    await this.prisma.guild.update({
      where: { id: guildId },
      data: { removed: true },
    });
  }
}
