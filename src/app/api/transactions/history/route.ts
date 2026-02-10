import type { NextRequest } from "next/server";

import { ok } from "@/utils/apiResponse";
import { withApiError, parseBody } from "@/utils/routeHandler";
import { requireAuth, requireStoreAccess } from "@/middleware/auth";
import { listTransactionsHistoryService } from "@/modules/transactions/transaction.service";
import { historyBodySchema } from "@/modules/transactions/transaction.validators";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  const body = await parseBody(req, historyBodySchema);
  requireStoreAccess(user, body.storeId);

  const now = new Date();
  const from = body.from ? new Date(body.from) : new Date(now);
  if (!body.from) from.setDate(from.getDate() - 30);
  const to = body.to ? new Date(body.to) : new Date(now);

  const data = await listTransactionsHistoryService(body.storeId, from, to);
  return ok(data, "OK");
});
