import { DISCORD } from "@cipibot/constants/src/discord";

if (
  !process.env.DISCORD_CLIENT_ID ||
  !process.env.DISCORD_CLIENT_SECRET ||
  !process.env.DISCORD_REDIRECT_URI ||
  !process.env.JWT_SECRET ||
  !process.env.ENCRYPTION_KEY ||
  process.env.ENCRYPTION_KEY.length !== 32
) {
  throw new Error(
    "DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, JWT_SECRET, or ENCRYPTION_KEY is not set or isn't exactly 32 characters in environment variables.",
  );
}

export const CONFIG = {
  CLIENT_ID: DISCORD.CLIENT_ID,
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  REDIRECT_URI: DISCORD.REDIRECT_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
};
