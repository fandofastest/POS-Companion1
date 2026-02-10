import { z } from "zod";

export const createCashierSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateCashierSchema = z.object({
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});
