import jwt from "jsonwebtoken";

import { env } from "@/lib/env";
import type { UserRole } from "@/types/roles";

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  storeIds: string[];
};

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "30d";

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: { sub: string }) {
  const secret = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyRefreshToken(token: string): { sub: string } {
  const secret = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;
  return jwt.verify(token, secret) as { sub: string };
}
