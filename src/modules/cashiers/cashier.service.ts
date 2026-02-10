import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { HttpError } from "@/utils/httpError";
import { createUser, listStaffByStoreId, updateUserById } from "@/modules/users/user.repository";
import type { CashierDto } from "@/modules/cashiers/cashier.dto";

function toDto(u: any): CashierDto {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: "STAFF",
    isActive: u.isActive ?? true,
    storeIds: (u.storeIds ?? []).map((s: any) => s.toString()),
  };
}

export async function createCashierService(input: {
  storeId: string;
  name: string;
  email: string;
  password: string;
}) {
  const hashed = await bcrypt.hash(input.password, 10);
  try {
    const doc = await createUser({
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashed,
      role: "STAFF",
      storeIds: [new mongoose.Types.ObjectId(input.storeId)],
    });

    return toDto(doc);
  } catch (e: any) {
    if (e?.code === 11000) throw new HttpError(409, "Email already registered");
    throw e;
  }
}

export async function listCashiersService(storeId: string) {
  const docs = await listStaffByStoreId(storeId);
  return docs.map(toDto);
}

export async function updateCashierService(input: {
  userId: string;
  isActive?: boolean;
  password?: string;
}) {
  const patch: any = {};
  if (typeof input.isActive === "boolean") patch.isActive = input.isActive;
  if (input.password) patch.password = await bcrypt.hash(input.password, 10);

  const updated = await updateUserById(input.userId, patch);
  if (!updated) throw new HttpError(404, "User not found");
  if (updated.role !== "STAFF") throw new HttpError(400, "Not a cashier");

  return toDto(updated);
}
