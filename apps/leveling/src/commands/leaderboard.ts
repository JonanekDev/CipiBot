import { Command } from '@cipibot/commands';
import { LevelingService } from '../service';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { KafkaClient } from '@cipibot/kafka';
import { DiscordInteractionReplyUpdateType } from '@cipibot/schemas';
import { t } from '@cipibot/i18n';
import { ConfigClient } from '@cipibot/config-client';
import { KAFKA_TOPICS } from '@cipibot/constants';
import {
  LeaderboardEntryVariables,
  LeaderboardVariables,
} from '@cipibot/templating/modules/leveling';
import { renderDiscordMessage } from '@cipibot/embeds/discord';
import { renderTemplate } from '@cipibot/templating';
import { CommandInteraction } from '@cipibot/schemas/discord';
import { Logger } from '@cipibot/logger';

export function createLeaderboardCommand(
  service: LevelingService,
  kafka: KafkaClient,
  configClient: ConfigClient,
  logger: Logger,
): Command {
  return {
    definition: {
      name: 'leaderboard',
      description: 'Shows the leaderboard of the server',
      type: ApplicationCommandType.ChatInput,
    },
    handler: async (interaction: CommandInteraction) => {
      const guildId = interaction.guild_id;
      if (!guildId) return;

      const config = await configClient.getGuildConfig(guildId);
      const leaderboard = await service.getLeaderboard(guildId, 5);

      const eventData: DiscordInteractionReplyUpdateType = {
        interactionId: interaction.id,
        interactionToken: interaction.token,
        body: {},
      };
      let leaderboardEntries: string = '';
      const entryTemplate = config.leveling.commands.leaderboard.leaderboardEntry
        ? config.leveling.commands.leaderboard.leaderboardEntry
        : t(config.language, 'leveling.leaderboardEntry');
      leaderboard.map(
        (entry, index) =>
          (leaderboardEntries +=
            renderTemplate<LeaderboardEntryVariables>(entryTemplate, {
              position: index + 1,
              userId: entry.userId,
              userMention: `<@${entry.userId}>`,
              level: entry.level,
              currentXP: entry.xp,
              messageCount: entry.messageCount,
            }) + '\n'),
      );

      eventData.body = renderDiscordMessage<LeaderboardVariables>(
        config.leveling.commands.leaderboard.customMessage,
        { entries: leaderboardEntries },
        {
          title: t(config.language, 'leveling.leaderboardTitle'),
          description: t(config.language, 'leveling.leaderboardDescription'),
        },
      );

      await kafka.sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.INTERACTION_REPLY_UPDATE, eventData);
    },
  };
}
