export const ROLES = [
  "ATHLETE",
  "COACH",
  "VENUE_MANAGER",
  "DISTRICT_OFFICER",
  "TOURNAMENT_ORGANIZER",
  "ADMIN",
  "GOV_ADMIN",
] as const;

export type Role = (typeof ROLES)[number];

export const GOV_ROLES: Role[] = ["ADMIN", "GOV_ADMIN"];
export const DISTRICT_ROLES: Role[] = ["DISTRICT_OFFICER", ...GOV_ROLES];

export function hasRole(userRole: string | undefined, allowed: Role[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as Role);
}

export function isGovUser(role: string | undefined): boolean {
  return hasRole(role, GOV_ROLES);
}

export function isDistrictUser(role: string | undefined): boolean {
  return hasRole(role, DISTRICT_ROLES);
}

export function canAccessAthleteData(role: string | undefined): boolean {
  return hasRole(role, ["COACH", "ADMIN", "GOV_ADMIN", "DISTRICT_OFFICER"]);
}
