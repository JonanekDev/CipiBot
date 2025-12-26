import z from "zod";

// Pro nested objekty, kde chceme použít defaulty z vnitřního schématu
export const withDefaults = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => val ?? {}, schema);
