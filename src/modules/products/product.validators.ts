import { z } from "zod";

export const createProductSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().min(2),
  sku: z.string().min(1),
  categoryId: z.string().nullable().optional(),
  unit: z.string().min(1).optional(),
  price: z.number().nonnegative(),
  stock: z.number().optional(),
  minimumStock: z.number().optional(),
  primaryImageUrl: z.string().url().nullable().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  sku: z.string().min(1).optional(),
  categoryId: z.string().nullable().optional(),
  unit: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().optional(),
  minimumStock: z.number().optional(),
  primaryImageUrl: z.string().url().nullable().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
});

export const adjustStockSchema = z.object({
  delta: z.number(),
});

export const listProductsBodySchema = z.object({
  storeId: z.string().min(1),
  q: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
});
