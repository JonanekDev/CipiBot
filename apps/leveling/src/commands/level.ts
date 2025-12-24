import { Command } from '@cipibot/commands';
import { LevelingService } from '../service';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  APIChatInputApplicationCommandInteraction,
  APIApplicationCommandInteractionDataUserOption,
  APIEmbed,
} from 'discord-api-types/v10';
import { sendEvent } from '@cipibot/kafka';
import { DiscordMessagePayloadType } from '@cipibot/schemas';
import { t } from '@cipibot/i18n';
import { getGuildConfig } from '@cipibot/config-client';
import { BRANDING, COLORS, KAFKA_TOPICS } from '@cipibot/constants';

export function createLevelCommand(service: LevelingService): Command {
  return {
    definition: {
      name: 'level',
      description: 'Shows the level of a user',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'user',
          description: 'User whose level you want to see',
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
    },
    handler: async (interaction: APIChatInputApplicationCommandInteraction) => {
      const guildId = interaction.guild_id;
      const channelId = interaction.channel.id;

      if (!guildId || !channelId) return;

      const config = await getGuildConfig(guildId);
      if (!config.leveling.enabled) return; //TODO: ERROR message

      let targetUserId = interaction.member?.user.id || interaction.user?.id;
      if (!targetUserId) return;

      const options = interaction.data.options;
      if (options) {
        const userOption = options.find(
          (o): o is APIApplicationCommandInteractionDataUserOption =>
            o.name === 'user' && o.type === ApplicationCommandOptionType.User,
        );

        if (userOption) {
          targetUserId = userOption.value;
        }
      }

      const stats = await service.getUserStats(guildId, targetUserId);

      const levelEmbed: APIEmbed = {
        title: t(config.language, 'leveling.levelCommandTitle', { user: `<@${targetUserId}>` }),
        description: t(config.language, 'leveling.levelCommandDescription', {
          user: `<@${targetUserId}>`,
          currentXP: stats?.xp ?? 0,
          level: stats ? stats.level : 0,
          messageCount: stats?.messageCount ?? 0,
        }),
        color: COLORS.PRIMARY,
        footer: { text: BRANDING.DEFAULT_FOOTER_TEXT },
      };

      const eventData: DiscordMessagePayloadType = {
        channelId: channelId,
        body: {
          embeds: [levelEmbed],
        },
      };

      await sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.SEND_MESSAGE, eventData);
    },
  };
}
