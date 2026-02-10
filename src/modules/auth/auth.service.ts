import bcrypt from "bcryptjs";

import { HttpError } from "@/utils/httpError";
import { createUser, findUserByEmail, findUserById } from "@/modules/users/user.repository";
import { signAccessToken, signRefreshToken } from "@/lib/jwt/tokens";
import type { LoginResponseDto, UserDto } from "@/modules/auth/auth.dto";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = input.email.toLowerCase();

  const existing = await findUserByEmail(email);
  if (existing) throw new HttpError(409, "Email already registered");

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await createUser({
    name: input.name,
    email,
    password: hashed,
    role: "OWNER",
    storeIds: [],
  });

  const dto: UserDto = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    storeIds: (user.storeIds ?? []).map((s) => s.toString()),
  };

  return dto;
}

export async function loginUser(input: { email: string; password: string }): Promise<LoginResponseDto> {
  const user = await findUserByEmail(input.email.toLowerCase());
  if (!user) throw new HttpError(401, "Invalid credentials");
  if (user.deletedAt) throw new HttpError(401, "Invalid credentials");
  if (user.isActive === false) throw new HttpError(403, "Account disabled");

  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) throw new HttpError(401, "Invalid credentials");

  const storeIds = (user.storeIds ?? []).map((s) => s.toString());

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    storeIds,
  });

  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      storeIds,
    },
    tokens: { accessToken, refreshToken },
  };
}

export async function reissueTokensForUser(userId: string): Promise<LoginResponseDto> {
  const user = await findUserById(userId);
  if (!user) throw new HttpError(401, "Unauthorized");
  if (user.deletedAt) throw new HttpError(401, "Unauthorized");
  if (user.isActive === false) throw new HttpError(403, "Account disabled");

  const storeIds = (user.storeIds ?? []).map((s) => s.toString());

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    storeIds,
  });

  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  const dto: UserDto = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    storeIds,
  };

  return { user: dto, tokens: { accessToken, refreshToken } };
}
