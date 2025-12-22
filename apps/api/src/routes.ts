import type { FastifyInstance } from 'fastify';
import { AuthController } from './controllers/auth.controller';
import { LoginReqSchema, LoginResSchema } from '@cipibot/schemas';
import { authenticate } from './auth.guard';

interface LoginBody {
  code: string;
}

export async function registerAPIRoutes(
  app: FastifyInstance,
  controller: { authController: AuthController}
): Promise<void> {
  app.post('/auth/login', {
    schema: {
      body: LoginReqSchema,
      response: {
        200: LoginResSchema,
      },
    }
  }, controller.authController.login);

  //Auth guard for protected routes
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', authenticate);

    protectedRoutes.get('/auth/me', {
      schema: {
        response: {
          200: LoginResSchema,
        },
      }
    }, controller.authController.me);
  })

}
