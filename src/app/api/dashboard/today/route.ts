import type { NextRequest } from "next/server";

import { ok } from "@/utils/apiResponse";
import { withApiError, parseBody } from "@/utils/routeHandler";
import { requireAuth, requireStoreAccess } from "@/middleware/auth";
import { storeScopeBodySchema } from "@/modules/dashboard/dashboard.validators";
import { getTodayDashboardService } from "@/modules/dashboard/dashboard.service";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  const body = await parseBody(req, storeScopeBodySchema);
  requireStoreAccess(user, body.storeId);
  const data = await getTodayDashboardService(body.storeId);
  return ok(data, "OK");
});
