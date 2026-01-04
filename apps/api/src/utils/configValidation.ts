import { TRPCError } from '@trpc/server';
import { GuildConfigPatchType } from '@cipibot/schemas';
import { createTRPCClient } from '@trpc/client';
import type { DiscordRestRouter } from '@cipibot/discord-rest/router';

export class ConfigValidator {
  constructor(
    private readonly discordRestClient: ReturnType<typeof createTRPCClient<DiscordRestRouter>>,
  ) {}

  async validateGuildConfigPatch(guildId: string, patch: GuildConfigPatchType): Promise<void> {
    const errors: string[] = [];

    // Collect all channel IDs to validate
    const channelIds: string[] = [];
    const roleIds: string[] = [];

    // Welcoming module channels
    if (patch.welcoming?.channelId) {
      channelIds.push(patch.welcoming.channelId);
    }

    // Leveling module channels
    if (patch.leveling?.levelUpMessageChannelId) {
      channelIds.push(patch.leveling.levelUpMessageChannelId);
    }
    if (patch.leveling?.ignoreChannelIds && patch.leveling.ignoreChannelIds.length > 0) {
      channelIds.push(...patch.leveling.ignoreChannelIds);
    }

    // Leveling role rewards
    if (patch.leveling?.roleRewards) {
      const roleRewardIds = Object.values(patch.leveling.roleRewards);
      roleIds.push(...roleRewardIds);
    }

    // Validate channels
    if (channelIds.length > 0) {
      try {
        const guildChannels = await this.discordRestClient.getGuildChannels.query({ guildId });
        const validChannelIds = new Set(guildChannels.map((c) => c.id));

        const invalidChannels = channelIds.filter((id) => !validChannelIds.has(id));
        if (invalidChannels.length > 0) {
          errors.push(
            `Invalid channel IDs: ${invalidChannels.join(', ')}. These channels do not exist in this guild.`,
          );
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate channels',
        });
      }
    }

    // Validate roles
    if (roleIds.length > 0) {
      try {
        const guildRoles = await this.discordRestClient.getGuildRoles.query({ guildId });
        const validRoleIds = new Set(guildRoles.map((r) => r.id));

        const invalidRoles = roleIds.filter((id) => !validRoleIds.has(id));
        if (invalidRoles.length > 0) {
          errors.push(
            `Invalid role IDs: ${invalidRoles.join(', ')}. These roles do not exist in this guild.`,
          );
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate roles',
        });
      }
    }

    if (errors.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Configuration validation failed: ${errors.join(' ')}`,
      });
    }
  }
}
