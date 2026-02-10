import type { UserRole } from "@/types/roles";

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeIds: string[];
  isActive: boolean;
  createdAt?: string;
};
