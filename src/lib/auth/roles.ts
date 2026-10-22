import type { PosRole, SharedUser } from "@/types/models";
export function resolvePosRole(user: Partial<SharedUser>): PosRole {
  if (user.posRole === "ADMIN" || user.posRole === "MANAGER" || user.posRole === "CASHIER") return user.posRole;
  if (user.role === "ADMIN" || user.role === "MANAGER" || user.role === "CASHIER") return user.role;
  return "CASHIER";
}
export function isActiveStaff(user: Partial<SharedUser> | undefined): user is SharedUser {
  return Boolean(user?.isStaff === true && user.status === "active");
}