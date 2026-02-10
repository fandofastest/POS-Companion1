import { connectMongo } from "@/lib/db/mongoose";
import { StoreModel, type StoreDoc } from "@/modules/stores/store.model";

export async function createStore(input: {
  name: string;
  address?: string | null;
  phone?: string | null;
  createdBy: string;
}) {
  await connectMongo();
  const doc = await StoreModel.create({
    name: input.name,
    address: input.address ?? null,
    phone: input.phone ?? null,
    createdBy: input.createdBy,
  });
  return doc as StoreDoc;
}

export async function listStoresByIds(ids: string[]) {
  await connectMongo();
  const rows = await StoreModel.find({ _id: { $in: ids }, deletedAt: null })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return rows as unknown as StoreDoc[];
}

export async function updateStore(
  id: string,
  patch: Partial<{ name: string; address: string | null; phone: string | null; isActive: boolean }>
) {
  await connectMongo();
  return (await StoreModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $set: patch },
    { new: true }
  ).exec()) as StoreDoc | null;
}
