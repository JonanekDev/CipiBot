import { Command } from '@cipibot/commands';
import { getUserOption } from '@cipibot/commands/options';
import { LevelingService } from '../service';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { DiscordInteractionReplyUpdateType } from '@cipibot/schemas';
import { t } from '@cipibot/i18n';
import { ConfigClient } from '@cipibot/config-client';
import { KAFKA_TOPICS } from '@cipibot/constants';
import { calculateXpForLevel } from '../calculator';
import { createErrorEmbed } from '@cipibot/embeds';
import { createLevelVariables, LevelVariables } from '@cipibot/templating/modules/leveling';
import { renderDiscordMessage } from '@cipibot/embeds/discord';
import { CommandInteraction } from '@cipibot/schemas/discord';
import { Logger } from '@cipibot/logger';
import { KafkaClient } from '@cipibot/kafka';

export function createLevelCommand(service: LevelingService, kafka: KafkaClient, configClient: ConfigClient, logger: Logger): Command {
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
    handler: async (interaction: CommandInteraction) => {
      const guildId = interaction.guild_id;

      if (!guildId) return;

      const config = await configClient.getGuildConfig(guildId);

      const userOptionResult = getUserOption(interaction, 'user')?.user;
      const targetUser = userOptionResult || interaction.member?.user || interaction.user;
      if (!targetUser) return; //TODO: ERROR
      if (targetUser.bot) {
        const eventData: DiscordInteractionReplyUpdateType = {
          interactionId: interaction.id,
          interactionToken: interaction.token,
          body: {
            embeds: [createErrorEmbed('COMMAND_OPTION_USER_NO_BOT', {}, config.language)],
          },
        };

        await kafka.sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.INTERACTION_REPLY_UPDATE, eventData);

        return;
      }

      const user = await service.getUser(guildId, targetUser.id);

      const eventData: DiscordInteractionReplyUpdateType = {
        interactionId: interaction.id,
        interactionToken: interaction.token,
        body: {},
      };

      const levelUpVariables = createLevelVariables(
        {
          userId: targetUser.id,
          username: targetUser.global_name ?? targetUser.username,
          avatar: targetUser.avatar,
        },
        {
          level: user?.level ?? 0,
          currentXP: user?.xp ?? 0,
          messageCount: user?.messageCount ?? 0,
        },
        calculateXpForLevel((user?.level ?? 0) + 1),
      );

      eventData.body = renderDiscordMessage<LevelVariables>(
        config.leveling.commands.level.customMessage,
        levelUpVariables,
        {
          title: t(config.language, 'leveling.levelCommandTitle'),
          description: t(config.language, 'leveling.levelCommandDescription'),
          thumbnail: { url: `{{avatarUrl}}` },
        },
      );

      await kafka.sendEvent(KAFKA_TOPICS.DISCORD_OUTBOUND.INTERACTION_REPLY_UPDATE, eventData);
    },
  };
}
