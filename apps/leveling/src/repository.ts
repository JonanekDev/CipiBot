import { PrismaClient, UserLevel } from './generated/prisma/client';

export class LevelingRepository {
  constructor(private prisma: PrismaClient) {}

  async upsertUser(
    guildId: string,
    userId: string,
    xpToAdd: number,
    levelUp: boolean,
  ): Promise<UserLevel> {
    const record = await this.prisma.userLevel.upsert({
      where: {
        guildId_userId: {
          guildId,
          userId,
        },
      },
      create: {
        guildId,
        userId,
        xp: xpToAdd,
        level: levelUp ? 1 : 0,
        messageCount: 1,
      },
      update: {
        xp: { increment: xpToAdd },
        level: levelUp ? { increment: 1 } : undefined,
        messageCount: { increment: 1 },
      },
    });
    return record;
  }

  async getLeaderboard(guildId: string, limit: number = 15): Promise<UserLevel[]> {
    return await this.prisma.userLevel.findMany({
      where: {
        guildId,
      },
      orderBy: {
        xp: 'desc',
      },
      take: limit,
    });
  }

  async getUser(guildId: string, userId: string): Promise<UserLevel | null> {
    return await this.prisma.userLevel.findUnique({
      where: {
        guildId_userId: {
          guildId,
          userId,
        },
      },
    });
  }

  async setUserLeftStatus(
    guildId: string,
    userId: string,
    left: boolean,
  ): Promise<UserLevel | void> {
    try {
      return await this.prisma.userLevel.update({
        where: {
          guildId_userId: {
            guildId,
            userId,
          },
        },
        data: {
          left,
        },
      });
    } catch (error) {
      return;
    }
  }
}
