import type { NextRequest } from "next/server";

import { withApiError, parseBody } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { createUserSchema } from "@/modules/users/user.validators";
import { createUserService, listUsersService } from "@/modules/users/user.service";

export const GET = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const data = await listUsersService();
  return ok(data, "OK");
});

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const body = await parseBody(req, createUserSchema);
  const data = await createUserService(body);
  return ok(data, "Created", 201);
});
