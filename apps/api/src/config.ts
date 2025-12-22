if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_REDIRECT_URI || !process.env.JWT_SECRET) {
  throw new Error('DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, or JWT_SECRET is not set');
}

export const CONFIG = {
  CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
  JWT_SECRET: process.env.JWT_SECRET
};
