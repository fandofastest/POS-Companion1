import bcrypt from "bcryptjs";

import { HttpError } from "@/utils/httpError";
import { createUser, listUsers } from "@/modules/users/user.repository";
import type { UserDoc } from "@/modules/users/user.model";
import type { UserDto } from "@/modules/users/user.dto";
import type { UserRole } from "@/types/roles";

function toDto(u: UserDoc): UserDto {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    storeIds: (u.storeIds ?? []).map((s: any) => s.toString()),
    isActive: u.isActive ?? true,
    createdAt: (u as any).createdAt ? new Date((u as any).createdAt).toISOString() : undefined,
  };
}

export async function listUsersService() {
  const docs = await listUsers();
  return docs.map(toDto);
}

export async function createUserService(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const hashed = await bcrypt.hash(input.password, 10);
  try {
    const doc = await createUser({
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashed,
      role: input.role,
      storeIds: [],
    });

    return toDto(doc);
  } catch (e: any) {
    if (e?.code === 11000) {
      throw new HttpError(409, "Email already registered");
    }
    throw e;
  }
}
