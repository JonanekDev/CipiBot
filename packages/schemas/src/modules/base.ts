import z from 'zod';

export const BaseModuleSchema = z.object({
  enabled: z.boolean().default(true),
});

export type BaseModuleType = z.infer<typeof BaseModuleSchema>;
