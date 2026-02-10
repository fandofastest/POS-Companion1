import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole, requireStoreAccess } from "@/middleware/auth";
import { createCashierSchema } from "@/modules/cashiers/cashier.validators";
import { createCashierService, listCashiersService } from "@/modules/cashiers/cashier.service";

export const GET = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const storeId = ctx?.params?.id as string;
  requireStoreAccess(user, storeId);

  const data = await listCashiersService(storeId);
  return ok(data, "OK");
});

export const POST = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const storeId = ctx?.params?.id as string;
  requireStoreAccess(user, storeId);

  const body = await parseBody(req, createCashierSchema);
  const data = await createCashierService({ storeId, ...body });
  return ok(data, "Created", 201);
});
