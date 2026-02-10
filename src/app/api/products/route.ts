import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole, requireStoreAccess } from "@/middleware/auth";
import { createProductSchema } from "@/modules/products/product.validators";
import { createProductService, listProductsService } from "@/modules/products/product.service";

export const GET = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  const storeId = user.storeIds?.[0];
  if (!storeId) return ok([], "OK");

  const data = await listProductsService({ storeId, categoryId: null, q: null });

  return ok(data, "OK");
});

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const body = await parseBody(req, createProductSchema);
  requireStoreAccess(user, body.storeId);
  const data = await createProductService(body);
  return ok(data, "Created", 201);
});
