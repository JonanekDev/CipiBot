import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import { AuthService } from './services/auth.service';
import { LoginReqSchema } from '@cipibot/schemas/api';
import { GuildConfigPatchSchema } from '@cipibot/schemas';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { ConfigRouter } from '@cipibot/config/router';
import type { LevelingRouter } from '@cipibot/leveling/router';

// Initialize tRPC Clients for Microservices
const configClient = createTRPCClient<ConfigRouter>({
  links: [httpBatchLink({ url: process.env.CONFIG_SERVICE_URL || 'http://localhost:3000/trpc' })],
});

const levelingClient = createTRPCClient<LevelingRouter>({
  links: [httpBatchLink({ url: process.env.LEVELING_SERVICE_URL || 'http://localhost:3001/trpc' })],
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
  const authRouter = t.router({
    login: t.procedure.input(LoginReqSchema).mutation(async ({ input, ctx }) => {
      const sessionData = await authService.login(input.code);

      const token = await ctx.res.jwtSign(
        {
          userId: sessionData.user.id,
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

      return {
        status: 'ok',
        data: sessionData,
      };
    }),
    me: protectedProcedure.query(async ({ ctx }) => {
      const sessionData = await authService.getSessionData(ctx.user.userId);
      return {
        status: 'ok',
        data: sessionData,
      };
    }),
    logout: protectedProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie('access_token');
      return { success: true };
    }),
  });

  const configRouter = t.router({
    getGuildConfig: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await configClient.getGuildConfig.query(input);
      }),
    updateGuildConfig: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          patch: GuildConfigPatchSchema,
        }),
      )
      .mutation(async ({ input }) => {
        return await configClient.updateGuildConfig.mutate(input);
      }),
  });

  const levelingRouter = t.router({
    getLeaderboard: t.procedure
      .input(z.object({ guildId: z.string() }))
      .query(async ({ input }) => {
        return await levelingClient.getWebLeaderboard.query(input);
      }),
  });

  return t.router({
    auth: authRouter,
    config: configRouter,
    leveling: levelingRouter,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
