import {
  PermissionFlagsBits,
  RESTGetAPICurrentUserGuildsResult,
  RESTGetAPICurrentUserResult,
  RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10';
import { CONFIG } from '../config';
import axios, { AxiosError } from 'axios';
import { PrismaClient } from '../generated/prisma/client';
import { RedisClient } from '@cipibot/redis';
import { UserGuild, UserGuildSchema } from '@cipibot/schemas/api';
import { UserType } from '@cipibot/schemas/discord';
import { ConfigClient } from '@cipibot/config-client';
import { Logger } from '@cipibot/logger';
import { encrypt, decrypt } from '../utils/encryption';
import { TRPCError } from '@trpc/server';

export class AuthService {
  private readonly logger: Logger;
  private readonly prisma: PrismaClient;
  private readonly redis: RedisClient;
  private readonly configClient: ConfigClient;

  constructor(
    prisma: PrismaClient,
    redis: RedisClient,
    logger: Logger,
    configClient: ConfigClient,
  ) {
    this.prisma = prisma;
    this.redis = redis;
    this.logger = logger.child({ module: 'AuthService' });
    this.configClient = configClient;
  }

  async login(code: string): Promise<UserType> {
    try {
      const params = new URLSearchParams({
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: CONFIG.REDIRECT_URI,
      });

      this.logger.info(
        {
          client_id: CONFIG.CLIENT_ID,
          redirect_uri: CONFIG.REDIRECT_URI,
          code_start: code.substring(0, 5),
          params: params.toString(),
        },
        'Attempting Discord Token Exchange',
      );

      const res = await axios.post<RESTPostOAuth2AccessTokenResult>(
        'https://discord.com/api/oauth2/token',
        params,
      );

      const userInfo = await this.getUserInfo(res.data.access_token);

      await this.prisma.user.upsert({
        where: { id: userInfo.id },
        create: {
          id: userInfo.id,
          discordAccessToken: encrypt(res.data.access_token),
          discordRefreshToken: encrypt(res.data.refresh_token),
          tokenExpiresAt: new Date(Date.now() + res.data.expires_in * 1000),
        },
        update: {
          discordAccessToken: encrypt(res.data.access_token),
          discordRefreshToken: encrypt(res.data.refresh_token),
          tokenExpiresAt: new Date(Date.now() + res.data.expires_in * 1000),
        },
      });

      return userInfo;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const discordError = axiosError.response?.data;

      this.logger.error(
        {
          status: axiosError.response?.status,
          discordError,
          message: axiosError.message,
        },
        'OAuth token exchange failed',
      );

      if (axiosError.response?.status === 400) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid authorization code: ${discordError?.error_description || 'Please try logging in again.'}`,
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to authenticate with Discord',
      });
    }
  }

  async getSessionData(userId: string): Promise<UserType> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      this.logger.error({ userId }, `User not found`);
      throw new Error('User not found');
    }

    const accessToken = decrypt(user.discordAccessToken);
    const userInfo = await this.getUserInfo(accessToken);
    return userInfo;
  }

  async getUserInfo(accessToken: string): Promise<UserType> {
    const res = await axios.get<RESTGetAPICurrentUserResult>('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      id: res.data.id,
      username: res.data.username,
      avatar: res.data.avatar,
      global_name: res.data.global_name,
      bot: res.data.bot,
    };
  }

  async hasGuildAccess(userId: string, guildId: string): Promise<boolean> {
    const guilds = await this.getGuildsForUser(userId);
    return guilds.some((g) => g.id === guildId);
  }

  async getGuildsForUser(userId: string): Promise<UserGuild[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      this.logger.error({ userId }, `User not found`);
      throw new Error('User not found');
    }

    const accessToken = decrypt(user.discordAccessToken);
    return this.getUserGuilds(accessToken, user.id);
  }

  async getUserGuilds(accessToken: string, userId: string): Promise<UserGuild[]> {
    const guilds = await this.requestDiscordGuilds(accessToken, userId);

    const guildIds = guilds.map((g) => g.id);

    const knownGuilds = await this.configClient.getKnownGuilds(guildIds);

    const dashboardGuilds: UserGuild[] = guilds.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      owner: guild.owner,
      permissions: guild.permissions,
      isKnown: knownGuilds.includes(guild.id),
      approximate_member_count: guild.approximate_member_count,
    }));

    return dashboardGuilds;
  }

  async requestDiscordGuilds(accessToken: string, userId: string): Promise<UserGuild[]> {
    const redis_cache_key = `user:guilds:${userId}`;
    const cache = await this.redis.get(redis_cache_key);
    if (cache) {
      return UserGuildSchema.array().parse(JSON.parse(cache));
    }
    const res = await axios.get<RESTGetAPICurrentUserGuildsResult>(
      'https://discord.com/api/users/@me/guilds?with_counts=true',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    res.data[0].permissions;

    const guilds = res.data.filter((guild) => {
      const permissions = BigInt(guild.permissions);
      const ADMIN = PermissionFlagsBits.Administrator;
      const MANAGE_GUILD = PermissionFlagsBits.ManageGuild;

      const hasAdmin = (permissions & ADMIN) === ADMIN;
      const hasManageGuild = (permissions & MANAGE_GUILD) === MANAGE_GUILD;

      return hasAdmin || hasManageGuild;
    });

    const parsedGuilds = UserGuildSchema.array().parse(guilds);
    await this.redis.set(redis_cache_key, JSON.stringify(parsedGuilds), 'EX', 600);
    return parsedGuilds;
  }

  async logout(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      this.logger.error({ userId }, `User not found`);
      throw new Error('User not found');
    }

    const accessToken = decrypt(user.discordAccessToken);
    const refreshToken = decrypt(user.discordRefreshToken);

    try {
      // Revoke access token
      await axios.post(
        'https://discord.com/api/oauth2/token/revoke',
        new URLSearchParams({
          client_id: CONFIG.CLIENT_ID,
          client_secret: CONFIG.CLIENT_SECRET,
          token: accessToken,
        }),
      );
    } catch (error) {
      this.logger.warn({ userId }, 'Failed to revoke access token');
    }

    try {
      // Revoke refresh token
      await axios.post(
        'https://discord.com/api/oauth2/token/revoke',
        new URLSearchParams({
          client_id: CONFIG.CLIENT_ID,
          client_secret: CONFIG.CLIENT_SECRET,
          token: refreshToken,
        }),
      );
    } catch (error) {
      this.logger.warn({ userId }, 'Failed to revoke refresh token');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.logger.info({ userId }, 'User logged out successfully');
  }
}
