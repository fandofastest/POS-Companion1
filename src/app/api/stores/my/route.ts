import type { NextRequest } from "next/server";

import { withApiError } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth } from "@/middleware/auth";
import { listMyStoresService } from "@/modules/stores/store.service";

export const GET = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  const data = await listMyStoresService(user.storeIds ?? []);
  return ok(data, "OK");
});
