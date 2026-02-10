import { HttpError } from "@/utils/httpError";
import { addStoreToUser } from "@/modules/users/user.repository";
import { createStore, listStoresByIds, updateStore } from "@/modules/stores/store.repository";
import type { StoreDto } from "@/modules/stores/store.dto";

function toDto(s: any): StoreDto {
  return {
    id: s._id.toString(),
    name: s.name,
    address: s.address ?? null,
    phone: s.phone ?? null,
    isActive: s.isActive ?? true,
    createdBy: s.createdBy.toString(),
  };
}

export async function createStoreService(input: {
  name: string;
  address?: string;
  phone?: string;
  createdBy: string;
}) {
  const doc = await createStore({
    name: input.name,
    address: input.address,
    phone: input.phone,
    createdBy: input.createdBy,
  });

  await addStoreToUser(input.createdBy, doc._id.toString());

  return toDto(doc);
}

export async function listMyStoresService(storeIds: string[]) {
  const docs = await listStoresByIds(storeIds);
  return docs.map(toDto);
}

export async function updateStoreService(
  storeId: string,
  patch: Partial<{ name: string; address: string | null; phone: string | null; isActive: boolean }>
) {
  const updated = await updateStore(storeId, patch);
  if (!updated) throw new HttpError(404, "Store not found");
  return toDto(updated);
}
