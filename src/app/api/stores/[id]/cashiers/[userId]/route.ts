import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole, requireStoreAccess } from "@/middleware/auth";
import { updateCashierSchema } from "@/modules/cashiers/cashier.validators";
import { updateCashierService } from "@/modules/cashiers/cashier.service";

export const PATCH = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const params = (await ctx?.params) as { id: string; userId: string } | undefined;
  const storeId = params?.id as string;
  requireStoreAccess(user, storeId);

  const userId = params?.userId as string;
  const body = await parseBody(req, updateCashierSchema);

  const data = await updateCashierService({ userId, ...body });
  return ok(data, "Updated");
});
