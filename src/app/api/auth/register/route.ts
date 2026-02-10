import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { registerSchema } from "@/modules/auth/auth.validators";
import { registerUser } from "@/modules/auth/auth.service";

export const POST = withApiError(async (req: NextRequest) => {
  const body = await parseBody(req, registerSchema);
  const data = await registerUser(body);
  return ok(data, "Registered", 201);
});
