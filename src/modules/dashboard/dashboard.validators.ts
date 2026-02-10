import { z } from "zod";

export const storeScopeBodySchema = z.object({
  storeId: z.string().min(1),
  limit: z.number().int().min(1).max(500).optional(),
});
