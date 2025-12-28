import { Command } from '@cipibot/commands';
import { LevelingService } from '../service';
import { createLevelCommand } from './level';
import { createLeaderboardCommand } from './leaderboard';
import { KafkaClient } from '@cipibot/kafka';
import { Logger } from '@cipibot/logger';
import { ConfigClient } from '@cipibot/config-client';

export function createCommands(service: LevelingService, kafka: KafkaClient, configClient: ConfigClient, logger: Logger): Map<string, Command> {
  const commands = new Map<string, Command>();
  const commandsLogger = logger.child({ package: 'Commands' });

  const levelCmd = createLevelCommand(service, kafka, configClient, commandsLogger);
  commands.set(levelCmd.definition.name, levelCmd);

  const leaderboardCmd = createLeaderboardCommand(service, kafka, configClient, commandsLogger);
  commands.set(leaderboardCmd.definition.name, leaderboardCmd);

  return commands;
}
