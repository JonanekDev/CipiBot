import {
  PermissionFlagsBits,
  RESTGetAPICurrentUserGuildsResult,
  RESTGetAPICurrentUserResult,
  RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10';
import { CONFIG } from '../config';
import axios from 'axios';
import { PrismaClient } from '../generated/prisma/client';
import { Redis } from '@cipibot/redis';
import { DashboardGuild, SessionDataType } from '@cipibot/schemas/api';
import { getKnownGuilds } from '@cipibot/config-client';

export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis,
  ) {}

  async login(code: string): Promise<SessionDataType> {
    const params = new URLSearchParams({
      client_id: CONFIG.CLIENT_ID,
      client_secret: CONFIG.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: CONFIG.REDIRECT_URI,
    });

    const res = await axios.post<RESTPostOAuth2AccessTokenResult>(
      'https://discord.com/api/oauth2/token',
      params,
    );

    const userInfo = await this.getUserInfo(res.data.access_token);

    await this.prisma.user.upsert({
      where: { id: userInfo.id },
      create: {
        id: userInfo.id,
        discordAccessToken: res.data.access_token,
        discordRefreshToken: res.data.refresh_token,
        tokenExpiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      },
      update: {
        discordAccessToken: res.data.access_token,
        discordRefreshToken: res.data.refresh_token,
        tokenExpiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      },
    });

    const guilds = await this.getUserGuilds(res.data.access_token, userInfo.id);

    return {
      user: userInfo,
      guilds: guilds,
    };
  }

  async getSessionData(userId: string): Promise<SessionDataType> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const userInfo = await this.getUserInfo(user.discordAccessToken);
    const guilds = await this.getUserGuilds(user.discordAccessToken, user.id);

    return {
      user: userInfo,
      guilds: guilds,
    };
  }

  async getUserInfo(accessToken: string): Promise<RESTGetAPICurrentUserResult> {
    const res = await axios.get<RESTGetAPICurrentUserResult>('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  }

  async getUserGuilds(accessToken: string, userId: string): Promise<DashboardGuild[]> {
    const guilds = await this.requestDiscordGuilds(accessToken, userId);

    const guildIds = guilds.map((g) => g.id);

    const knownGuilds = await getKnownGuilds(guildIds);

    const dashboardGuilds: DashboardGuild[] = guilds.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      isKnown: knownGuilds.includes(guild.id),
    }));

    return dashboardGuilds;
  }

  async requestDiscordGuilds(
    accessToken: string,
    userId: string,
  ): Promise<RESTGetAPICurrentUserGuildsResult> {
    const redis_cache_key = `user:guilds:${userId}`;
    const cache = await this.redis.getex(redis_cache_key, 'EX', 120);
    if (cache) {
      return JSON.parse(cache) as RESTGetAPICurrentUserGuildsResult;
    }
    const res = await axios.get<RESTGetAPICurrentUserGuildsResult>(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const guilds = res.data.filter((guild) => {
      const permissions = BigInt(guild.permissions);
      const ADMIN = PermissionFlagsBits.Administrator;
      const MANAGE_GUILD = PermissionFlagsBits.ManageGuild;

      const hasAdmin = (permissions & ADMIN) === ADMIN;
      const hasManageGuild = (permissions & MANAGE_GUILD) === MANAGE_GUILD;

      return hasAdmin || hasManageGuild;
    });
    await this.redis.setex(redis_cache_key, 120, JSON.stringify(guilds));
    return guilds;
  }
}
