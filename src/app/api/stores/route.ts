import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { createStoreSchema } from "@/modules/stores/store.validators";
import { createStoreService } from "@/modules/stores/store.service";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const body = await parseBody(req, createStoreSchema);
  const data = await createStoreService({ ...body, createdBy: user.sub });
  return ok(data, "Created", 201);
});
