import { DiscordMessagePayloadType, GuildConfigType, RolePayloadType } from '@cipibot/schemas';
import { UserLevel } from './generated/prisma/browser';
import { ConfigClient } from '@cipibot/config-client';
import { t } from '@cipibot/i18n';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { KafkaClient } from '@cipibot/kafka';
import { calculateXpForLevel, calculateXpFromMessage } from './calculator';
import { LevelingRepository } from './repository';
import { renderDiscordMessage } from '@cipibot/embeds/discord';
import { createLevelUpVariables, LevelUpVariables } from '@cipibot/templating/modules/leveling';
import { UserType } from '@cipibot/schemas/discord';
import { Logger } from '@cipibot/logger';

export class LevelingService {
  private readonly logger: Logger;
  private readonly levelingRepository: LevelingRepository;
  private readonly kafka: KafkaClient;
  private readonly configClient: ConfigClient;

  constructor(
    kafka: KafkaClient,
    logger: Logger,
    levelingRepository: LevelingRepository,
    configClient: ConfigClient,
  ) {
    this.kafka = kafka;
    this.logger = logger.child({ service: 'LevelingService' });
    this.levelingRepository = levelingRepository;
    this.configClient = configClient;
  }

  async syncMemberPresence(guildId: string, userId: string, left: boolean): Promise<void> {
    await this.levelingRepository.setUserLeftStatus(guildId, userId, left);
  }

  async processMessage(
    guildId: string,
    config: GuildConfigType,
    user: UserType,
    message: string,
    channelId: string,
  ): Promise<void> {
    const record = await this.levelingRepository.getUser(guildId, user.id);
    const xpAdded = calculateXpFromMessage(message, config.leveling);
    // TODO: Role based XP bonuses ?
    const currentLevel = record ? record.level : 0;
    const currentXp = record ? record.xp : 0;
    const xpNeededForNextLevel = calculateXpForLevel(currentLevel + 1);
    let levelUp = false;
    if (currentXp + xpAdded >= xpNeededForNextLevel) {
      levelUp = true;
      let eventData: DiscordMessagePayloadType = {
        channelId: config.leveling.levelUpMessageChannelId ?? channelId,
        body: {},
      };

      const levelUpVariables = createLevelUpVariables(
        {
          userId: user.id,
          username: user.global_name || user.username,
          avatar: user.avatar || undefined,
        },
        {
          level: currentLevel + 1,
          currentXP: currentXp + xpAdded,
          messageCount: record ? record.messageCount + 1 : 1,
        },
      );

      eventData.body = renderDiscordMessage<LevelUpVariables>(
        config.leveling.levelUpMessage,
        levelUpVariables,
        {
          title: t(config.language, 'leveling.levelUpTitle'),
          description: t(config.language, 'leveling.levelUpDescription'),
          thumbnail: { url: `{{avatarUrl}}` },
        },
      );

      this.kafka.sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_MESSAGE, eventData);

      // Role reward
      const roleId = config.leveling.roleRewards[(currentLevel + 1).toString()];
      if (roleId) {
        const eventData: RolePayloadType = {
          guildId,
          userId: user.id,
          roleId,
        };
        this.kafka.sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.MEMBER_ROLE_ADD, eventData);
      }
    }

    await this.levelingRepository.upsertUser(guildId, user.id, xpAdded, levelUp);
  }

  async getLeaderboard(guildId: string, limit?: number): Promise<UserLevel[]> {
    return this.levelingRepository.getLeaderboard(guildId, limit);
  }

  async getWebLeaderboard(guildId: string): Promise<UserLevel[]> {
    const config = await this.configClient.getGuildConfig(guildId);

    if (!config.leveling.enabled) {
      throw new Error('Leveling is disabled for this guild');
    }

    if (!config.leveling.webLeaderboardEnabled) {
      throw new Error('Web leaderboard is disabled for this guild');
    }

    return this.levelingRepository.getLeaderboard(guildId);
  }

  async getUser(guildId: string, userId: string): Promise<UserLevel | null> {
    return this.levelingRepository.getUser(guildId, userId);
  }
}
