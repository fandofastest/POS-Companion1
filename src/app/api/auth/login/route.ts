import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { rateLimit } from "@/utils/rateLimit";
import { loginSchema } from "@/modules/auth/auth.validators";
import { loginUser } from "@/modules/auth/auth.service";

export const POST = withApiError(async (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  rateLimit({ key: `login:${ip}`, limit: 30, windowMs: 60_000 });

  const body = await parseBody(req, loginSchema);
  const data = await loginUser(body);

  return ok(data, "Logged in");
});
