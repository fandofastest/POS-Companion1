import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole, requireStoreAccess } from "@/middleware/auth";
import { updateStoreSchema } from "@/modules/stores/store.validators";
import { updateStoreService } from "@/modules/stores/store.service";

export const PATCH = withApiError(async (req: NextRequest, ctx?: any) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const params = (await ctx?.params) as { id: string } | undefined;
  const id = params?.id as string;
  requireStoreAccess(user, id);

  const body = await parseBody(req, updateStoreSchema);
  const data = await updateStoreService(id, body);
  return ok(data, "Updated");
});
