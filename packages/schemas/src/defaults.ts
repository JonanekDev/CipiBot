import z from 'zod';

// For nested schemas, apply defaults at any level by preprocessing undefined values to {}
export const withDefaults = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => val ?? {}, schema);
