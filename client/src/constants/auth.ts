export const USER_ROLES = Object.freeze({
  ADMIN: "Admin",
  WRITER: "Writer",
} as const);

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
