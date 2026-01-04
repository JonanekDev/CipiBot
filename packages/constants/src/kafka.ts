export const KAFKA_TOPICS = {
  DISCORD_INBOUND: {
    GUILD_UPDATE: 'discord.guild.update',
    GUILD_CREATE: 'discord.guild.create',
    GUILD_DELETE: 'discord.guild.delete',
    MESSAGE_CREATE: 'discord.message.create',
    GUILD_MEMBER_ADD: 'discord.guild.member.add',
    GUILD_MEMBER_REMOVE: 'discord.guild.member.remove',
    CHANNEL_CREATE: 'discord.channel.create',
    CHANNEL_UPDATE: 'discord.channel.update',
    CHANNEL_DELETE: 'discord.channel.delete',
    GUILD_ROLE_CREATE: 'discord.guild.role.create',
    GUILD_ROLE_UPDATE: 'discord.guild.role.update',
    GUILD_ROLE_DELETE: 'discord.guild.role.delete',
  },

  DISCORD_OUTBOUND: {
    MEMBER_ROLE_ADD: 'discord.outbound.member.role.add',
    MEMBER_ROLE_REMOVE: 'discord.outbound.member.role.remove',
    SEND_MESSAGE: 'discord.outbound.send.message',
    SEND_DM: 'discord.outbound.send.dm',
    INTERACTION_REPLY_UPDATE: 'discord.outbound.interaction.reply.update',
  },
  SYSTEM: {
    COMMANDS_UPDATE: 'system.commands.update',
  },
} as const;
