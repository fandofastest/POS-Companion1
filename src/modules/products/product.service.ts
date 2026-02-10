import { HttpError } from "@/utils/httpError";
import {
  adjustStock,
  createProduct,
  listProducts,
  updateProduct,
} from "@/modules/products/product.repository";
import type { ProductDto } from "@/modules/products/product.dto";

function toDto(p: any): ProductDto {
  return {
    id: p._id.toString(),
    storeId: p.storeId.toString(),
    name: p.name,
    sku: p.sku,
    categoryId: p.categoryId ? p.categoryId.toString() : null,
    unit: p.unit ?? "pcs",
    price: p.price,
    stock: p.stock ?? 0,
    minimumStock: p.minimumStock ?? 0,
    primaryImageUrl: p.primaryImageUrl ?? null,
    imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls : [],
    isActive: p.isActive ?? true,
  };
}

export async function createProductService(input: {
  storeId: string;
  name: string;
  sku: string;
  categoryId?: string | null;
  unit?: string;
  price: number;
  stock?: number;
  minimumStock?: number;
  primaryImageUrl?: string | null;
  imageUrls?: string[];
}) {
  const doc = await createProduct({
    storeId: input.storeId,
    name: input.name,
    sku: input.sku,
    categoryId: input.categoryId ?? null,
    unit: input.unit,
    price: input.price,
    stock: input.stock,
    minimumStock: input.minimumStock,
    primaryImageUrl: input.primaryImageUrl ?? null,
    imageUrls: input.imageUrls,
  });
  return toDto(doc);
}

export async function listProductsService(filter: { storeId: string; categoryId?: string | null; q?: string | null }) {
  const docs = await listProducts(filter);
  return docs.map(toDto);
}

export async function updateProductService(
  id: string,
  patch: Partial<{
    name: string;
    sku: string;
    categoryId: string | null;
    unit: string;
    price: number;
    stock: number;
    minimumStock: number;
    primaryImageUrl: string | null;
    imageUrls: string[];
    isActive: boolean;
  }>
) {
  const updated = await updateProduct(id, patch);
  if (!updated) throw new HttpError(404, "Product not found");
  return toDto(updated);
}

export async function adjustStockService(id: string, delta: number) {
  const updated = await adjustStock(id, delta);
  if (!updated) throw new HttpError(404, "Product not found");
  return toDto(updated);
}
