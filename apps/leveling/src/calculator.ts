import { LevelingConfig } from '@cipibot/schemas';

export function calculateXpForLevel(level: number): number {
  return 75 * level * level;
}

export function calculateXpFromMessage(message: string, config: LevelingConfig): number {
  const wordsCount = message.trim().split(/\s+/).length;
  const wordsXp = wordsCount * config.xpPerWord;
  const xpPerMessage = config.xpPerMessage;
  const totalXpGain = wordsXp + xpPerMessage;

  // Cap is without multiplier
  const cappedXpGain = Math.floor(
    Math.min(totalXpGain, config.maxXPPersMessage) * config.xpMultiplier,
  );
  return cappedXpGain;
}
