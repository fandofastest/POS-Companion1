import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { updateCategorySchema } from "@/modules/categories/category.validators";
import { updateCategoryService } from "@/modules/categories/category.service";

export const PATCH = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const id = ctx?.params?.id as string;
  const body = await parseBody(req, updateCategorySchema);
  const data = await updateCategoryService(id, body);
  return ok(data, "Updated");
});
