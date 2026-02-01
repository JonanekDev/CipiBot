import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import { AuthService } from './services/auth.service';
import { LoginReqSchema, LoginRes, UserGuildRes } from '@cipibot/schemas/api';
import { GuildConfigPatchSchema } from '@cipibot/schemas';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { ConfigRouter } from '@cipibot/config/router';
import type { LevelingRouter } from '@cipibot/leveling/router';
import type { DiscordRestRouter } from '@cipibot/discord-rest/router';
import { ConfigValidator } from './utils/configValidation';

// Initialize tRPC Clients for Microservices
const configClient = createTRPCClient<ConfigRouter>({
  links: [httpBatchLink({ url: process.env.CONFIG_SERVICE_URL || 'http://localhost:3003/trpc' })],
});

const levelingClient = createTRPCClient<LevelingRouter>({
  links: [httpBatchLink({ url: process.env.LEVELING_SERVICE_URL || 'http://localhost:3002/trpc' })],
});

const discordRestClient = createTRPCClient<DiscordRestRouter>({
  links: [
    httpBatchLink({ url: process.env.DISCORD_REST_SERVICE_URL || 'http://localhost:3004/trpc' }),
  ],
});

export const t = initTRPC.context<Context>().create();

// Auth Middleware
const isAuthed = t.middleware(async ({ ctx, next }) => {
  try {
    await ctx.req.jwtVerify();
  } catch (err) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.req.user as { userId: string },
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

export function createAppRouter(authService: AuthService) {
  const configValidator = new ConfigValidator(discordRestClient);

  const authRouter = t.router({
    login: t.procedure.input(LoginReqSchema).mutation(async ({ input, ctx }) => {
      const userData = await authService.login(input.code);

      const token = await ctx.res.jwtSign(
        {
          userId: userData.id,
        },
        {
          expiresIn: '7d',
        },
      );

      ctx.res.setCookie('access_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      const res: LoginRes = {
        status: 'ok',
        data: userData,
      };

      return res;
    }),
    me: protectedProcedure.query(async ({ ctx }) => {
      const userInfo = await authService.getSessionData(ctx.user.userId);

      const res: LoginRes = {
        status: 'ok',
        data: userInfo,
      };

      return res;
    }),
    guilds: protectedProcedure.query(async ({ ctx }) => {
      const guilds = await authService.getGuildsForUser(ctx.user.userId);

      const res: UserGuildRes = {
        status: 'ok',
        data: guilds,
      };

      return res;
    }),
    logout: protectedProcedure.mutation(async ({ ctx }) => {
      await authService.logout(ctx.user.userId);
      ctx.res.clearCookie('access_token');
      return { success: true };
    }),
  });

  const guildRouter = t.router({
    getGuildChannels: protectedProcedure
      .input(
        z.object({
          guildId: z.string(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const hasAccess = await authService.hasGuildAccess(ctx.user.userId, input.guildId);
        if (!hasAccess) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'No access to this guild' });
        }
        return await discordRestClient.getGuildChannels.query(input);
      }),
    getGuildRoles: protectedProcedure
      .input(
        z.object({
          guildId: z.string(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const hasAccess = await authService.hasGuildAccess(ctx.user.userId, input.guildId);
        if (!hasAccess) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'No access to this guild' });
        }
        return await discordRestClient.getGuildRoles.query(input);
      }),
  });

  const configRouter = t.router({
    getGuild: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const hasAccess = await authService.hasGuildAccess(ctx.user.userId, input.id);
        if (!hasAccess) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'No access to this guild' });
        }
        return await configClient.getGuild.query(input);
      }),
    updateGuildConfig: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          patch: GuildConfigPatchSchema,
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const hasAccess = await authService.hasGuildAccess(ctx.user.userId, input.id);
        if (!hasAccess) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'No access to this guild' });
        }

        await configValidator.validateGuildConfigPatch(input.id, input.patch);

        return await configClient.updateGuildConfig.mutate(input);
      }),
  });

  const levelingRouter = t.router({
    getLeaderboard: t.procedure // Leaderboard is usually public, keeping it public or use protectedProcedure if needed
      .input(z.object({ guildId: z.string() }))
      .query(async ({ input }) => {
        return await levelingClient.getWebLeaderboard.query(input);
      }),
  });

  return t.router({
    auth: authRouter,
    config: configRouter,
    leveling: levelingRouter,
    guild: guildRouter,
  });
}

export type ApiRouter = ReturnType<typeof createAppRouter>;
