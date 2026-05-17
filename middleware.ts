import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  ADMIN_PORTAL_ROLES,
  getDashboardForRole,
} from "@/lib/auth-routes";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { csrfProtection } from "@/lib/middleware/security";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // 1. Security & Rate Limiting
  const csrfResponse = csrfProtection(req as any);
  if (csrfResponse) return csrfResponse;

  if (pathname.startsWith("/login")) {
    const rlResponse = rateLimit(req as any, { limit: Number(process.env.RATE_LIMIT_LOGIN_PER_MIN || 5), windowMs: 60000 });
    if (rlResponse) return rlResponse;
  }
  if (pathname.startsWith("/api/auth/register")) {
    const rlResponse = rateLimit(req as any, { limit: Number(process.env.RATE_LIMIT_REGISTER_PER_HOUR || 3), windowMs: 3600000 });
    if (rlResponse) return rlResponse;
  }
  if (pathname.startsWith("/api/divi")) {
    const rlResponse = rateLimit(req as any, { limit: Number(process.env.RATE_LIMIT_AI_PER_MIN || 10), windowMs: 60000 });
    if (rlResponse) return rlResponse;
  }

  const isLoggedIn = !!session;
  const role = session?.user?.role;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isProtected =
    pathname.startsWith("/athlete") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/venue") ||
    pathname.startsWith("/coach") ||
    pathname.startsWith("/district");

  // Allow login/register when switching portal (?switch=1) or explicit role in URL
  const allowPortalSwitch =
    nextUrl.searchParams.get("switch") === "1" ||
    nextUrl.searchParams.has("role");

  if (isLoggedIn && isAuthRoute && !allowPortalSwitch) {
    return NextResponse.redirect(
      new URL(getDashboardForRole(role), nextUrl)
    );
  }

  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isProtected && role) {
    if (pathname.startsWith("/admin") && !ADMIN_PORTAL_ROLES.has(role)) {
      return NextResponse.redirect(
        new URL(getDashboardForRole(role), nextUrl)
      );
    }
    if (pathname.startsWith("/venue") && role !== "VENUE_MANAGER") {
      return NextResponse.redirect(
        new URL(getDashboardForRole(role), nextUrl)
      );
    }
    if (pathname.startsWith("/athlete") && role !== "ATHLETE") {
      return NextResponse.redirect(
        new URL(getDashboardForRole(role), nextUrl)
      );
    }
    if (pathname.startsWith("/coach") && role !== "COACH") {
      return NextResponse.redirect(
        new URL(getDashboardForRole(role), nextUrl)
      );
    }
    if (
      pathname.startsWith("/district") &&
      role !== "DISTRICT_OFFICER" &&
      role !== "ADMIN" &&
      role !== "GOV_ADMIN"
    ) {
      return NextResponse.redirect(
        new URL(getDashboardForRole(role), nextUrl)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/api/:path*",
    "/athlete/:path*",
    "/admin/:path*",
    "/venue/:path*",
    "/coach/:path*",
    "/district/:path*",
    "/login",
    "/register",
  ],
};
