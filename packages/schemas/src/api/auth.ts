import z from 'zod';
import { UserSchema } from '../discord';
import { OkResponseSchema } from './response';

export const LoginReqSchema = z.object({
  code: z.string().min(2),
});

export type LoginReq = z.infer<typeof LoginReqSchema>;

export const LoginResSchema = OkResponseSchema(UserSchema);

export type LoginRes = z.infer<typeof LoginResSchema>;
