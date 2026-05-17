// app/api/admin/budget/route.ts — Budget Management API
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getBudgetSummary, allocateBudget } from "@/lib/services/budget-service";
import { logAction } from "@/lib/services/audit-service";
import { z } from "zod";

// GET /api/admin/budget?year=2025-26
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["ADMIN", "GOV_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") || undefined;

  const summary = await getBudgetSummary(year);
  return NextResponse.json({ success: true, data: summary });
}

const allocateSchema = z.object({
  fiscalYear: z.string().min(1),
  sport: z.string().optional(),
  district: z.string().optional(),
  amount: z.number().positive(),
  source: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

// POST /api/admin/budget — create allocation (GOV_ADMIN only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (role !== "GOV_ADMIN") {
    return NextResponse.json({ error: "Forbidden — GOV_ADMIN only" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = allocateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const allocation = await allocateBudget({
    ...parsed.data,
    approvedBy: session.user.id,
  });

  await logAction(
    session.user.id,
    "BUDGET_ALLOCATION",
    "BudgetAllocation",
    allocation.id,
    `₹${parsed.data.amount} allocated for ${parsed.data.sport || "General"} in ${parsed.data.district || "State-wide"}`
  );

  return NextResponse.json({ success: true, data: allocation }, { status: 201 });
}
