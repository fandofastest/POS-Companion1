import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { createCategorySchema } from "@/modules/categories/category.validators";
import { createCategoryService, listCategoriesService } from "@/modules/categories/category.service";

export const GET = withApiError(async () => {
  const data = await listCategoriesService();
  return ok(data, "OK");
});

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const body = await parseBody(req, createCategorySchema);
  const data = await createCategoryService(body);
  return ok(data, "Created", 201);
});
