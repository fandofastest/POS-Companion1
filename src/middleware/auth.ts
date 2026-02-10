import type { NextRequest } from "next/server";

import { verifyAccessToken, type AccessTokenPayload } from "@/lib/jwt/tokens";
import { HttpError } from "@/utils/httpError";
import type { UserRole } from "@/types/roles";

export function getBearerToken(req: NextRequest) {
  const h = req.headers.get("authorization");
  if (!h) return null;
  const [t, v] = h.split(" ");
  if (t?.toLowerCase() !== "bearer" || !v) return null;
  return v;
}

export function requireAuth(req: NextRequest): AccessTokenPayload {
  const token = getBearerToken(req);
  if (!token) throw new HttpError(401, "Unauthorized");
  try {
    return verifyAccessToken(token);
  } catch {
    throw new HttpError(401, "Invalid token");
  }
}

export function requireRole(user: AccessTokenPayload, roles: UserRole[]) {
  if (!roles.includes(user.role)) throw new HttpError(403, "Forbidden");
}

export function requireStoreAccess(user: AccessTokenPayload, storeId: string) {
  if (!user.storeIds?.includes(storeId)) throw new HttpError(403, "No store access");
}
