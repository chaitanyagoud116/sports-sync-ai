// lib/services/budget-service.ts — Government Budget Management
import { prisma } from "@/lib/db";

export async function allocateBudget(data: {
  fiscalYear: string;
  sport?: string;
  district?: string;
  amount: number;
  source?: string;
  category?: string;
  description?: string;
  approvedBy?: string;
}) {
  return prisma.budgetAllocation.create({
    data: {
      fiscalYear: data.fiscalYear,
      sport: data.sport,
      district: data.district,
      amount: data.amount,
      source: data.source || "STATE_FUND",
      category: data.category || "GENERAL",
      description: data.description,
      approvedBy: data.approvedBy,
    },
  });
}

export async function getBudgetSummary(fiscalYear?: string) {
  const year = fiscalYear || getCurrentFiscalYear();

  const [totalAllocated, totalSpent, bySport, byDistrict, byCategory, bySource] =
    await Promise.all([
      prisma.budgetAllocation.aggregate({
        where: { fiscalYear: year },
        _sum: { amount: true, spent: true },
      }),
      prisma.budgetAllocation.aggregate({
        where: { fiscalYear: year },
        _sum: { spent: true },
      }),
      prisma.budgetAllocation.groupBy({
        by: ["sport"],
        where: { fiscalYear: year, sport: { not: null } },
        _sum: { amount: true, spent: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
      prisma.budgetAllocation.groupBy({
        by: ["district"],
        where: { fiscalYear: year, district: { not: null } },
        _sum: { amount: true, spent: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
      prisma.budgetAllocation.groupBy({
        by: ["category"],
        where: { fiscalYear: year },
        _sum: { amount: true, spent: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
      prisma.budgetAllocation.groupBy({
        by: ["source"],
        where: { fiscalYear: year },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
    ]);

  return {
    fiscalYear: year,
    totalAllocated: totalAllocated._sum.amount || 0,
    totalSpent: totalSpent._sum.spent || 0,
    utilizationPercent:
      totalAllocated._sum.amount
        ? Math.round(((totalSpent._sum.spent || 0) / totalAllocated._sum.amount) * 100)
        : 0,
    bySport: bySport.map((s) => ({
      sport: s.sport,
      allocated: s._sum.amount || 0,
      spent: s._sum.spent || 0,
    })),
    byDistrict: byDistrict.map((d) => ({
      district: d.district,
      allocated: d._sum.amount || 0,
      spent: d._sum.spent || 0,
    })),
    byCategory: byCategory.map((c) => ({
      category: c.category,
      allocated: c._sum.amount || 0,
      spent: c._sum.spent || 0,
    })),
    bySource: bySource.map((s) => ({
      source: s.source,
      allocated: s._sum.amount || 0,
    })),
  };
}

export async function getDistrictBudget(district: string, fiscalYear?: string) {
  const year = fiscalYear || getCurrentFiscalYear();
  const allocations = await prisma.budgetAllocation.findMany({
    where: { fiscalYear: year, district },
    orderBy: { createdAt: "desc" },
  });

  const total = allocations.reduce((sum, a) => sum + a.amount, 0);
  const spent = allocations.reduce((sum, a) => sum + a.spent, 0);

  return { district, fiscalYear: year, allocations, total, spent, utilization: total ? Math.round((spent / total) * 100) : 0 };
}

export async function trackExpenditure(
  allocationId: string,
  additionalSpent: number,
  description?: string
) {
  const allocation = await prisma.budgetAllocation.findUnique({
    where: { id: allocationId },
  });
  if (!allocation) throw new Error("Allocation not found");

  const newSpent = allocation.spent + additionalSpent;
  const status =
    newSpent >= allocation.amount
      ? "FULLY_SPENT"
      : newSpent > 0
        ? "PARTIALLY_SPENT"
        : "ALLOCATED";

  return prisma.budgetAllocation.update({
    where: { id: allocationId },
    data: { spent: newSpent, status, description: description || allocation.description },
  });
}

function getCurrentFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Indian fiscal year: April to March
  if (month >= 3) return `${year}-${(year + 1).toString().slice(2)}`;
  return `${year - 1}-${year.toString().slice(2)}`;
}
