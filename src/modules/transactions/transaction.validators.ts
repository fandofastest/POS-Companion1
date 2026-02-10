import { z } from "zod";

export const createTransactionSchema = z.object({
  storeId: z.string().min(1),
  invoiceNumber: z.string().min(1).optional(),
  paymentMethod: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1),
        price: z.number().nonnegative(),
      })
    )
    .min(1),
});

export const historyQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const todayBodySchema = z.object({
  storeId: z.string().min(1),
  limit: z.number().int().min(1).max(500).optional(),
});

export const historyBodySchema = z.object({
  storeId: z.string().min(1),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
