import type { NextRequest } from "next/server";

import { ok } from "@/utils/apiResponse";
import { withApiError, parseBody } from "@/utils/routeHandler";
import { requireAuth, requireRole, requireStoreAccess } from "@/middleware/auth";
import { createTransactionSchema } from "@/modules/transactions/transaction.validators";
import { createTransactionService } from "@/modules/transactions/transaction.service";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN", "STAFF"]);

  const body = await parseBody(req, createTransactionSchema);
  requireStoreAccess(user, body.storeId);
  const data = await createTransactionService({
    storeId: body.storeId,
    invoiceNumber: body.invoiceNumber,
    paymentMethod: body.paymentMethod,
    discount: body.discount,
    tax: body.tax,
    cashReceived: body.cashReceived,
    items: body.items,
    cashierId: user.sub,
  });

  return ok(data, "Created", 201);
});
