import { CommandType } from '@cipibot/schemas';
import { GuildConfig } from '@cipibot/schemas';
import { BaseModuleType } from '@cipibot/schemas';

type ModuleKeys = {
  [K in keyof GuildConfig]: GuildConfig[K] extends BaseModuleType ? K : never;
}[keyof GuildConfig];

export interface CommandMetaDefinition {
  module: ModuleKeys;

  get: (config: GuildConfig) => CommandType;
}

export const COMMAND_META: Record<string, CommandMetaDefinition> = {
  level: {
    module: 'leveling',
    get: (config: GuildConfig) => config.leveling.commands.level,
  },
  leaderboard: {
    module: 'leveling',
    get: (config: GuildConfig) => config.leveling.commands.leaderboard,
  },
};
