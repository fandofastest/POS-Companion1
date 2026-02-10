import mongoose from "mongoose";

import { connectMongo } from "@/lib/db/mongoose";
import { UserModel, type UserDoc } from "@/modules/users/user.model";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: "OWNER" | "ADMIN" | "STAFF";
  storeIds?: mongoose.Types.ObjectId[];
};

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  await connectMongo();
  return (await UserModel.findOne({ email, deletedAt: null }).exec()) as UserDoc | null;
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  await connectMongo();
  return (await UserModel.findOne({ _id: id, deletedAt: null }).exec()) as UserDoc | null;
}

export async function createUser(input: CreateUserInput): Promise<UserDoc> {
  await connectMongo();
  const doc = await UserModel.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    storeIds: input.storeIds ?? [],
  });
  return doc as UserDoc;
}

export async function addStoreToUser(userId: string, storeId: string) {
  await connectMongo();
  await UserModel.updateOne(
    { _id: userId, deletedAt: null },
    { $addToSet: { storeIds: new mongoose.Types.ObjectId(storeId) } }
  ).exec();
}

export async function listUsers(): Promise<UserDoc[]> {
  await connectMongo();
  const rows = await UserModel.find({ deletedAt: null })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return rows as unknown as UserDoc[];
}

export async function listStaffByStoreId(storeId: string): Promise<UserDoc[]> {
  await connectMongo();
  const rows = await UserModel.find({
    deletedAt: null,
    role: "STAFF",
    storeIds: new mongoose.Types.ObjectId(storeId),
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return rows as unknown as UserDoc[];
}

export async function updateUserById(
  id: string,
  patch: Partial<{ isActive: boolean; password: string }>
): Promise<UserDoc | null> {
  await connectMongo();
  const updated = await UserModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: patch },
    { new: true }
  ).exec();
  return updated as UserDoc | null;
}
