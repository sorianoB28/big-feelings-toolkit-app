export const APP_ROLES = ["teacher", "sel_coach", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  role: AppRole;
};

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}
