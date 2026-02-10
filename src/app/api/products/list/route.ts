import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireStoreAccess } from "@/middleware/auth";
import { listProductsBodySchema } from "@/modules/products/product.validators";
import { listProductsService } from "@/modules/products/product.service";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  const body = await parseBody(req, listProductsBodySchema);
  requireStoreAccess(user, body.storeId);

  const data = await listProductsService({
    storeId: body.storeId,
    categoryId: body.categoryId ?? null,
    q: body.q ?? null,
  });

  return ok(data, "OK");
});
