export const KAFKA_TOPICS = {
  DISCORD_INBOUND: {
    GUILD_UPDATE: 'discord.guild.update',
    GUILD_CREATE: 'discord.guild.create',
    GUILD_DELETE: 'discord.guild.delete',
    MESSAGE_CREATE: 'discord.message.create',
    GUILD_MEMBER_ADD: 'discord.guild.member.add',
    GUILD_MEMBER_REMOVE: 'discord.guild.member.remove',
  },

  DISCORD_OUTBOUND: {
    MEMBER_ROLE_ADD: 'discord.outbound.member.role.add',
    SEND_MESSAGE: 'discord.outbound.send.message',
    INTERACTION_REPLY: 'discord.outbound.interaction.reply',
  },
  SYSTEM: {
    COMMANDS_UPDATE: 'system.commands.update',
  },
} as const;
