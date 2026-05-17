// lib/middleware/security.ts
import { NextRequest, NextResponse } from "next/server";

export function csrfProtection(req: NextRequest): NextResponse | null {
  // Only apply to mutating requests
  const method = req.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return null;
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  // In production, we should strict check against exact host/domain
  // For local dev, origin might be http://localhost:3000 and host localhost:3000
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      // Strip port for safer comparison in dev/prod
      if (originUrl.hostname !== host.split(':')[0]) {
         return NextResponse.json(
          { error: "CSRF token validation failed / Origin mismatch" },
          { status: 403 }
        );
      }
    } catch {
       return NextResponse.json(
        { error: "Invalid Origin header" },
        { status: 403 }
      );
    }
  }

  return null;
}
