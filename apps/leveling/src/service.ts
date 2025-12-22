import { DiscordMessagePayloadType, GuildConfigType, RolePayloadType } from '@cipibot/schemas';
import { UserLevel } from './generated/prisma/browser';
import { PrismaClient } from './generated/prisma/client';
import { getGuildConfig } from '@cipibot/config-client';
import { APIEmbed } from 'discord-api-types/v10';
import { t } from '@cipibot/i18n';
import { BRANDING, COLORS } from '@cipibot/constants';
import { sendEvent } from '@cipibot/kafka';

export class LevelingService {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(guildId: string, userId: string, initialXp: number = 0): Promise<UserLevel> {
    const record = await this.prisma.userLevel.create({
      data: {
        guildId,
        userId,
        xp: initialXp,
        messageCount: initialXp > 0 ? 1 : 0,
      },
    });
    return record;
  }

  async getUserStats(guildId: string, userId: string): Promise<UserLevel | null> {
    const record = await this.prisma.userLevel.findUnique({
      where: {
        guildId_userId: {
          guildId,
          userId,
        },
      },
    });
    return record;
  }

  async handleMessage(
    author_id: string,
    content: string,
    channel_id: string,
    guild_id?: string,
  ): Promise<void> {
    const guildId = guild_id;
    if (!guildId) return;
    getGuildConfig(guildId).then((config) => {
      const levelingConfig = config.leveling;
      if (!levelingConfig.enabled) return;
      if (levelingConfig.ignoreChannelIds.includes(channel_id)) return;
      this.processMessage(guildId, config, author_id, content, channel_id);
    });
  }

  async handleMemberAdd(guildId: string, userId: string): Promise<void> {
    // USes updateMany so i don't have to check if the user exists
    await this.prisma.userLevel.updateMany({
      where: {
        userId,
        guildId,
      },
      data: {
        left: false,
      },
    });
  }

  async handleMemberRemove(guildId: string, userId: string): Promise<void> {
    // USes updateMany so i don't have to check if the user exists
    await this.prisma.userLevel.updateMany({
      where: {
        userId,
        guildId,
      },
      data: {
        left: true,
      },
    });
  }

  async processMessage(
    guildId: string,
    config: GuildConfigType,
    userId: string,
    message: string,
    channelId: string,
  ): Promise<void> {
    const record = await this.getUserStats(guildId, userId);

    const wordsCount = message.trim().split(/\s+/).length;
    const wordsXp = wordsCount * config.leveling.xpPerWord;
    const xpPerMessage = config.leveling.xpPerMessage;
    const totalXpGain = wordsXp + xpPerMessage;

    // Cap is without multiplier
    const cappedXpGain = Math.floor(
      Math.min(totalXpGain, config.leveling.maxXPPersMessage) * config.leveling.xpMultiplier,
    );

    // TODO: Role based XP bonuses ?

    if (record) {
      const xpNeededForNextLevel = 100 * (record.level + 1) * (record.level + 1);
      let levelUp = false;
      if (record.xp + cappedXpGain >= xpNeededForNextLevel) {
        levelUp = true;
        // Default level up message
        if (!config.leveling.levelUpMessage) {
          const levelUpEmbed: APIEmbed = {
            title: t(config.language, 'leveling.levelUpTitle'),
            description: t(config.language, 'leveling.levelUpDescription', {
              level: record.level + 1,
              user: `<@${userId}>`,
            }),
            color: COLORS.PRIMARY,
            footer: { text: BRANDING.DEFAULT_FOOTER_TEXT },
          };
          const eventData: DiscordMessagePayloadType = {
            channelId: config.leveling.levelUpMessageChannelId ?? channelId,
            body: {
              embeds: [levelUpEmbed],
            },
          };
          sendEvent('discord.outbound.message.create', eventData);
        }
        //TODO: Custom level up message
        const roleId = config.leveling.roleRewards[(record.level + 1).toString()];
        if (roleId) {
          const eventData: RolePayloadType = {
            guildId,
            userId,
            roleId,
          };
          sendEvent('discord.outbound.member.role.add', eventData);
        }
      }
      await this.prisma.userLevel.update({
        where: {
          guildId_userId: {
            guildId,
            userId,
          },
        },
        data: {
          xp: { increment: cappedXpGain },
          level: levelUp ? { increment: 1 } : undefined,
          messageCount: { increment: 1 },
          left: record.left ? false : undefined,
        },
      });
    } else {
      await this.createUser(guildId, userId, totalXpGain);
    }
  }

  async getLeaderboard(guildId: string): Promise<UserLevel[]> {
    const leaderboard = await this.prisma.userLevel.findMany({
      where: {
        guildId,
      },
      orderBy: {
        xp: 'desc',
      },
      take: 10,
    });
    return leaderboard;
  }
}
