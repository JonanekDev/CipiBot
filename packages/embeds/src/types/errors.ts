export type ErrorVariables = {
    MODULE_DISABLED: { module: string };
    COMMAND_OPTION_USER_NO_BOT: Record<string, never>;
}

export type ErrorType = keyof ErrorVariables;