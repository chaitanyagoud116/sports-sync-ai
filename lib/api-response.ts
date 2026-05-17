import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  code: string,
  message: string,
  status: number
) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

export function unauthorized() {
  return apiError("UNAUTHORIZED", "Authentication required", 401);
}

export function forbidden() {
  return apiError("FORBIDDEN", "You do not have permission for this action", 403);
}
