export const USER_ROLES = ["OWNER", "ADMIN", "STAFF"] as const;

export type UserRole = (typeof USER_ROLES)[number];
