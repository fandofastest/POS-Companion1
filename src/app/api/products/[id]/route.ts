import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { updateProductSchema } from "@/modules/products/product.validators";
import { updateProductService } from "@/modules/products/product.service";

export const PATCH = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const params = (await ctx?.params) as { id: string } | undefined;
  const id = params?.id as string;
  const body = await parseBody(req, updateProductSchema);
  const data = await updateProductService(id, body);
  return ok(data, "Updated");
});
