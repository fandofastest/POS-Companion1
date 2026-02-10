import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(1).nullable().optional(),
  phone: z.string().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
});
