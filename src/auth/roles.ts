export type Role = "VISITOR" | "MEMBER" | "ADMIN";

export const roleRank: Record<Role, number> = {
  VISITOR: 0,
  MEMBER: 1,
  ADMIN: 2,
};

export function hasAtLeastRole(userRole: Role, required: Role) {
  return roleRank[userRole] >= roleRank[required];
}
