import { HttpError } from "@/utils/httpError";
import {
  createCategory,
  listCategories,
  updateCategory,
} from "@/modules/categories/category.repository";
import type { CategoryDto } from "@/modules/categories/category.dto";

function toDto(c: any): CategoryDto {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    isActive: c.isActive ?? true,
  };
}

export async function createCategoryService(input: { name: string; slug: string }) {
  const doc = await createCategory({
    name: input.name,
    slug: input.slug.trim().toLowerCase(),
  });
  return toDto(doc);
}

export async function listCategoriesService() {
  const docs = await listCategories();
  return docs.map(toDto);
}

export async function updateCategoryService(
  id: string,
  patch: Partial<{ name: string; slug: string; isActive: boolean }>
) {
  if (patch.slug) patch.slug = patch.slug.trim().toLowerCase();
  const updated = await updateCategory(id, patch);
  if (!updated) throw new HttpError(404, "Category not found");
  return toDto(updated);
}
