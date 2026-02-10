import type { NextRequest } from "next/server";

import { ok } from "@/utils/apiResponse";
import { withApiError, parseBody } from "@/utils/routeHandler";
import { requireAuth, requireStoreAccess } from "@/middleware/auth";
import { listTransactionsTodayService } from "@/modules/transactions/transaction.service";
import { todayBodySchema } from "@/modules/transactions/transaction.validators";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  const body = await parseBody(req, todayBodySchema);
  requireStoreAccess(user, body.storeId);
  const data = await listTransactionsTodayService(body.storeId, body.limit ?? 100);
  return ok(data, "OK");
});
