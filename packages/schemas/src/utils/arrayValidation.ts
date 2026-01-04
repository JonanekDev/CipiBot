import { z } from 'zod';

export function uniqueArray<T extends z.ZodTypeAny>(itemSchema: T, message?: string) {
  return z.array(itemSchema).refine((arr) => new Set(arr).size === arr.length, {
    message: message || 'Array must not contain duplicate values',
  });
}

