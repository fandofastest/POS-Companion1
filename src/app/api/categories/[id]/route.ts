import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { updateCategorySchema } from "@/modules/categories/category.validators";
import { softDeleteCategoryService, updateCategoryService } from "@/modules/categories/category.service";

export const PATCH = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const params = (await ctx?.params) as { id: string } | undefined;
  const id = params?.id as string;
  const body = await parseBody(req, updateCategorySchema);
  const data = await updateCategoryService(id, body);
  return ok(data, "Updated");
});

export const DELETE = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const params = (await ctx?.params) as { id: string } | undefined;
  const id = params?.id as string;
  const data = await softDeleteCategoryService(id);
  return ok(data, "Deleted");
});
