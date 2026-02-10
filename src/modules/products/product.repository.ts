import { connectMongo } from "@/lib/db/mongoose";
import { ProductModel, type ProductDoc } from "@/modules/products/product.model";

export async function createProduct(input: {
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
  await connectMongo();
  const doc = await ProductModel.create({
    storeId: input.storeId,
    name: input.name,
    sku: input.sku,
    categoryId: input.categoryId ?? null,
    unit: input.unit ?? "pcs",
    price: input.price,
    stock: input.stock ?? 0,
    minimumStock: input.minimumStock ?? 0,
    primaryImageUrl: input.primaryImageUrl ?? null,
    imageUrls: input.imageUrls ?? (input.primaryImageUrl ? [input.primaryImageUrl] : []),
  });
  return doc as ProductDoc;
}

export async function listProducts(filter: { storeId: string; categoryId?: string | null; q?: string | null }) {
  await connectMongo();
  const query: any = { deletedAt: null, storeId: filter.storeId };

  if (filter?.categoryId) query.categoryId = filter.categoryId;
  if (filter?.q) query.name = { $regex: filter.q, $options: "i" };

  const rows = await ProductModel.find(query).sort({ createdAt: -1 }).lean().exec();
  return rows as unknown as ProductDoc[];
}

export async function findProductById(id: string) {
  await connectMongo();
  return (await ProductModel.findOne({ _id: id, deletedAt: null }).exec()) as ProductDoc | null;
}

export async function findProductByIdAndStore(id: string, storeId: string) {
  await connectMongo();
  return (await ProductModel.findOne({ _id: id, storeId, deletedAt: null }).exec()) as ProductDoc | null;
}

export async function updateProduct(
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
  await connectMongo();
  return (await ProductModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: patch },
    { new: true }
  ).exec()) as ProductDoc | null;
}

export async function adjustStock(id: string, delta: number) {
  await connectMongo();
  return (await ProductModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $inc: { stock: delta } },
    { new: true }
  ).exec()) as ProductDoc | null;
}
