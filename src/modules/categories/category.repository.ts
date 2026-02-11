import { connectMongo } from "@/lib/db/mongoose";
import { CategoryModel, type CategoryDoc } from "@/modules/categories/category.model";

export async function createCategory(input: { name: string; slug: string }) {
  await connectMongo();
  const doc = await CategoryModel.create({
    name: input.name,
    slug: input.slug,
  });
  return doc as CategoryDoc;
}

export async function listCategories() {
  await connectMongo();
  const rows = await CategoryModel.find({ deletedAt: null })
    .sort({ name: 1 })
    .lean()
    .exec();
  return rows as unknown as CategoryDoc[];
}

export async function findCategoryById(id: string) {
  await connectMongo();
  return (await CategoryModel.findOne({ _id: id, deletedAt: null }).exec()) as CategoryDoc | null;
}

export async function updateCategory(
  id: string,
  patch: Partial<{ name: string; slug: string; isActive: boolean; deletedAt: Date | null }>
) {
  await connectMongo();
  return (await CategoryModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: patch },
    { new: true }
  ).exec()) as CategoryDoc | null;
}
