import { CommandType } from '@cipibot/schemas';
import { GuildConfigType } from '@cipibot/schemas';
import { BaseModuleType } from '@cipibot/schemas';

type ModuleKeys = {
  [K in keyof GuildConfigType]: GuildConfigType[K] extends BaseModuleType ? K : never;
}[keyof GuildConfigType];

export interface CommandMetaDefinition {
  module: ModuleKeys;

  get: (config: GuildConfigType) => CommandType;
}

export const COMMAND_META: Record<string, CommandMetaDefinition> = {
  level: {
    module: 'leveling',
    get: (config: GuildConfigType) => config.leveling.commands.level,
  },
  leaderboard: {
    module: 'leveling',
    get: (config: GuildConfigType) => config.leveling.commands.leaderboard,
  },
};
