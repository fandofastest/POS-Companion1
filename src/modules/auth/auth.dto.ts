import type { UserRole } from "@/types/roles";

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeIds: string[];
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginResponseDto = {
  user: UserDto;
  tokens: AuthTokensDto;
};
