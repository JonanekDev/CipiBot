import { z } from 'zod';

export const OkResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    status: z.literal('ok'),
    data: dataSchema,
  });

export const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.any()).optional(),
});

export const ErrorResponseSchema = z.object({
  status: z.literal('error'),
  error: errorSchema,
});

export type ErrorRes = z.infer<typeof ErrorResponseSchema>;
