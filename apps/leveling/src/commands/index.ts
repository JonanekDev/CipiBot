import { Command } from '@cipibot/commands';
import { LevelingService } from '../service';
import { createLevelCommand } from './level';

export function createCommands(service: LevelingService): Map<string, Command> {
  const commands = new Map<string, Command>();

  const levelCmd = createLevelCommand(service);
  commands.set(levelCmd.definition.name, levelCmd);

  return commands;
}
