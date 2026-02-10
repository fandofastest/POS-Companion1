import type { NextRequest } from "next/server";

import { withApiError } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth } from "@/middleware/auth";
import { reissueTokensForUser } from "@/modules/auth/auth.service";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  const data = await reissueTokensForUser(user.sub);
  return ok(data, "OK");
});
