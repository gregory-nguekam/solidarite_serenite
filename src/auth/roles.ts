export type Role = "VISITOR" | "ADHERENT" | "SUPER_ADMIN" | "ADMIN_MEMBRE";

export const roleRank: Record<Role, number> = {
  VISITOR: 0,
  ADHERENT: 1,
  ADMIN_MEMBRE: 2,
  SUPER_ADMIN: 3, 
};

export function hasAtLeastRole(userRole: Role, required: Role) {
  return roleRank[userRole] >= roleRank[required];
}
