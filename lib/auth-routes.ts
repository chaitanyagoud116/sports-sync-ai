/** Dashboard path for each user role after login */
export const ROLE_DASHBOARDS: Record<string, string> = {
  ATHLETE: "/athlete/dashboard",
  COACH: "/coach/dashboard",
  VENUE_MANAGER: "/venue/dashboard",
  DISTRICT_OFFICER: "/district/dashboard",
  ADMIN: "/admin/dashboard",
  GOV_ADMIN: "/admin/dashboard",
  TOURNAMENT_ORGANIZER: "/admin/tournaments",
};

export function getDashboardForRole(role: string | undefined | null): string {
  if (!role) return "/login";
  return ROLE_DASHBOARDS[role] ?? "/login";
}

/** Roles allowed to access /admin/* */
export const ADMIN_PORTAL_ROLES = new Set([
  "ADMIN",
  "GOV_ADMIN",
  "TOURNAMENT_ORGANIZER",
]);

export const PORTAL_LOGIN_LINKS = [
  {
    role: "ATHLETE",
    label: "Athlete Portal",
    description: "Profile, tournaments, performance & AI insights",
    href: "/login?role=ATHLETE&switch=1",
    color: "#3b82f6",
  },
  {
    role: "COACH",
    label: "Coach Portal",
    description: "Athletes, training sessions & evaluations",
    href: "/login?role=COACH&switch=1",
    color: "#10b981",
  },
  {
    role: "DISTRICT_OFFICER",
    label: "District Portal",
    description: "District athletes, events & announcements",
    href: "/login?role=DISTRICT_OFFICER&switch=1",
    color: "#f59e0b",
  },
  {
    role: "ADMIN",
    label: "Admin Portal",
    description: "State sports operations & approvals",
    href: "/login?role=ADMIN&switch=1",
    color: "#8b5cf6",
  },
  {
    role: "GOV_ADMIN",
    label: "Government Portal",
    description: "Executive dashboards & AI state reports",
    href: "/login?role=GOV_ADMIN&switch=1",
    color: "#7c3aed",
  },
  {
    role: "VENUE_MANAGER",
    label: "Venue Portal",
    description: "Bookings, calendar & maintenance",
    href: "/login?role=VENUE_MANAGER&switch=1",
    color: "#06b6d4",
  },
] as const;
