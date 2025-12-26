import { Command } from '@cipibot/commands';
import { LevelingService } from '../service';
import { createLevelCommand } from './level';
import { createLeaderboardCommand } from './leaderboard';

export function createCommands(service: LevelingService): Map<string, Command> {
  const commands = new Map<string, Command>();

  const levelCmd = createLevelCommand(service);
  commands.set(levelCmd.definition.name, levelCmd);

  const leaderboardCmd = createLeaderboardCommand(service);
  commands.set(leaderboardCmd.definition.name, leaderboardCmd);

  return commands;
}
