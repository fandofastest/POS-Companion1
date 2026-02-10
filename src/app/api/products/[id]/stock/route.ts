import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { adjustStockSchema } from "@/modules/products/product.validators";
import { adjustStockService } from "@/modules/products/product.service";

export const POST = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN", "STAFF"]);

  const id = ctx?.params?.id as string;
  const body = await parseBody(req, adjustStockSchema);
  const data = await adjustStockService(id, body.delta);
  return ok(data, "Stock updated");
});
