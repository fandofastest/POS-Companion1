import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { createStoreSchema } from "@/modules/stores/store.validators";
import { createStoreService } from "@/modules/stores/store.service";
import { reissueTokensForUser } from "@/modules/auth/auth.service";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const body = await parseBody(req, createStoreSchema);
  const data = await createStoreService({ ...body, createdBy: user.sub });

  const auth = await reissueTokensForUser(user.sub);
  return ok({ store: data, auth }, "Created", 201);
});
