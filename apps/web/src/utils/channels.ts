import { GuildChannel } from '@cipibot/schemas';
import { getItemName, getNotUsedItems } from './common';

export function getTextChannels(channels: GuildChannel[]): GuildChannel[] {
  return channels.filter(
    (channel) =>
      channel.type === 0 || // GUILD_TEXT
      channel.type === 5 || // GUILD_ANNOUNCEMENT
      channel.type === 15, // GUILD_FORUM
  );
}

export function getNotUsedChannels(
  allChannels: GuildChannel[],
  usedChannelIds: string[],
): GuildChannel[] {
  return getNotUsedItems(allChannels, usedChannelIds);
}

export function getChannelName(id: string, channels: GuildChannel[]): string {
  return getItemName(id, channels, '#');
}
