import type { NextRequest } from "next/server";

import { ok } from "@/utils/apiResponse";
import { withApiError, parseBody } from "@/utils/routeHandler";
import { requireAuth, requireStoreAccess } from "@/middleware/auth";
import { storeScopeBodySchema } from "@/modules/dashboard/dashboard.validators";
import { getLowStockService } from "@/modules/dashboard/dashboard.service";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  const body = await parseBody(req, storeScopeBodySchema);
  requireStoreAccess(user, body.storeId);
  const data = await getLowStockService(body.storeId, body.limit ?? 20);
  return ok(data, "OK");
});
