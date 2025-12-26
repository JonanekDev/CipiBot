import { Command } from '@cipibot/commands';
import { getUserOption } from '@cipibot/commands/options';
import { LevelingService } from '../service';
import {
  ApplicationCommandType,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import { DiscordInteractionReplyType } from '@cipibot/schemas';
import { t } from '@cipibot/i18n';
import { getGuildConfig } from '@cipibot/config-client';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { createErrorEmbed } from '@cipibot/embeds';
import {
  LeaderboardEntryVariables,
  LeaderboardVariables,
} from '@cipibot/templating/modules/leveling';
import { renderDiscordMessage } from '@cipibot/embeds/discord';
import { renderTemplate } from '@cipibot/templating';

export function createLeaderboardCommand(service: LevelingService): Command {
  return {
    definition: {
      name: 'leaderboard',
      description: 'Shows the leaderboard of the server',
      type: ApplicationCommandType.ChatInput,
    },
    handler: async (interaction: APIChatInputApplicationCommandInteraction) => {
      const guildId = interaction.guild_id;
      if (!guildId) return;

      const config = await getGuildConfig(guildId);
      if (!config.leveling.enabled) {
        const eventData: DiscordInteractionReplyType = {
          interactionId: interaction.id,
          interactionToken: interaction.token,
          body: {
            embeds: [createErrorEmbed('MODULE_DISABLED', { module: 'Leveling' }, config.language)],
          },
          ephemeral: true,
        };

        await sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.INTERACTION_REPLY, eventData);

        return;
      }

      const leaderboard = await service.getLeaderboard(guildId, 5);

      const eventData: DiscordInteractionReplyType = {
        interactionId: interaction.id,
        interactionToken: interaction.token,
        body: {},
        ephemeral: config.leveling.commands.level.ephemeral,
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

      await sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.INTERACTION_REPLY, eventData);
    },
  };
}
