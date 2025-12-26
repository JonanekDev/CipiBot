import { createUserVariables, UserVariables } from "./common";

export interface LevelUpVariables extends UserVariables {
    level: number;
    currentXP: number;
    messageCount: number;
}

export function createLevelUpVariables(
    user: Parameters<typeof createUserVariables>[0],
    level: { level: number,
    currentXP: number,
    messageCount: number }
): LevelUpVariables {
    return {
        ...createUserVariables(user),
        level: level.level,
        currentXP: level.currentXP,
        messageCount: level.messageCount,
    };
}

export interface LeaderboardEntryVariables extends UserVariables {
    position: number;
    level: number;
    currentXP: number;
    messageCount: number;
}

export interface LevelVariables extends LevelUpVariables {
    xpForNextLevel: number;
}

export function createLevelVariables(
    user: Parameters<typeof createUserVariables>[0],
    level: Parameters<typeof createLevelUpVariables>[1],
    xpForNextLevel: number
): LevelVariables {
    return {
        ...createLevelUpVariables(user, level),
        xpForNextLevel,
    };
}