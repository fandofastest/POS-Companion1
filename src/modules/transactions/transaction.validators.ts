import { z } from "zod";

export const createTransactionSchema = z.object({
  storeId: z.string().min(1),
  invoiceNumber: z.string().min(1).optional(),
  paymentMethod: z.string().min(1),
  discount: z
    .object({
      type: z.enum(["AMOUNT", "PERCENT"]),
      amount: z.number().int().nonnegative().optional(),
      percent: z.number().min(0).max(100).optional(),
    })
    .optional(),
  tax: z
    .object({
      rate: z.number().min(0).max(1),
      inclusive: z.boolean().optional(),
    })
    .optional(),
  cashReceived: z.number().int().nonnegative().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1),
        price: z.number().int().nonnegative(),
      })
    )
    .min(1),
}).superRefine((val, ctx) => {
  if (val.discount) {
    if (val.discount.type === "AMOUNT") {
      if (typeof val.discount.amount !== "number") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount", "amount"], message: "Required" });
      }
      if (typeof val.discount.percent === "number") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount", "percent"], message: "Not allowed for AMOUNT" });
      }
    }
    if (val.discount.type === "PERCENT") {
      if (typeof val.discount.percent !== "number") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount", "percent"], message: "Required" });
      }
      if (typeof val.discount.amount === "number") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount", "amount"], message: "Not allowed for PERCENT" });
      }
    }
  }
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
