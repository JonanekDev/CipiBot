import { JsonValue } from '@prisma/client/runtime/client';
import { Guild, PrismaClient } from './generated/prisma/client';

export class ConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getGuildConfig(guildId: string): Promise<JsonValue | null> {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      select: { config: true },
    });
    return guild;
  }

  async upsertGuildConfig(guildId: string, config: object) {
    const guild = await this.prisma.guild.upsert({
      where: { id: guildId },
      create: { id: guildId, config },
      update: { config },
    });
    return guild.config;
  }

  async upsertGuildWithoutConfig(
    guildId: string,
    name: string,
    icon: string | null,
  ): Promise<Guild> {
    return await this.prisma.guild.upsert({
      where: { id: guildId },
      create: { id: guildId, name, icon },
      update: { name, icon },
    });
  }

  async filterKnownGuilds(guildIds: string[]): Promise<string[]> {
    const knownGuilds = await this.prisma.guild.findMany({
      where: {
        id: { in: guildIds },
      },
      select: { id: true },
    });
    return knownGuilds.map((guild) => guild.id);
  }
}
