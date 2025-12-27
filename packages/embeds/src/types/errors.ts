export type ErrorVariables = {
  MODULE_DISABLED: { module: string };
  COMMAND_DISABLED: { command: string };
  COMMAND_UNAVAILABLE: { command: string };
  COMMAND_OPTION_USER_NO_BOT: Record<string, never>;
};

export type ErrorType = keyof ErrorVariables;
