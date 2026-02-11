import type { NextRequest } from "next/server";

import { withApiError } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth } from "@/middleware/auth";

export const GET = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  return ok(user, "OK");
});
