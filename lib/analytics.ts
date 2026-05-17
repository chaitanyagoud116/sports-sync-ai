// lib/analytics.ts — Analytics computation helpers
// Computes talent scores, performance trends, and aggregated KPIs

export function computeTalentScore(opts: {
  winRate: number;        // 0-1: tournament wins / total entries
  performanceTrend: number; // 0-1: normalized slope of recent records
  consistencyScore: number; // 0-1: inverse std deviation
  participationRate: number; // 0-1: events entered vs available
  medalCount: number;     // raw medals
  resultsCount: number;   // raw results
}): number {
  const {
    winRate,
    performanceTrend,
    consistencyScore,
    participationRate,
    medalCount,
    resultsCount,
  } = opts;

  // Bonus for medals (capped at 0.15)
  const medalBonus = Math.min(0.15, medalCount * 0.05);

  // Base: weighted formula
  const base =
    winRate * 0.30 +
    performanceTrend * 0.25 +
    consistencyScore * 0.20 +
    participationRate * 0.15 +
    Math.min(resultsCount / 20, 1) * 0.10;

  return Math.min(100, Math.round((base + medalBonus) * 100));
}

// Simple linear regression slope for performance trend
export function computeTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY);
    den += (i - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

// Consistency score: 1 - normalized std deviation
export function computeConsistency(values: number[]): number {
  if (values.length < 2) return 0.5;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  const cvNorm = Math.min(std / (mean || 1), 1); // coefficient of variation capped at 1
  return 1 - cvNorm;
}

// Format numbers for display
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// Sport display name map
export const SPORT_LABELS: Record<string, string> = {
  FOOTBALL: "Football",
  CRICKET: "Cricket",
  KABADDI: "Kabaddi",
  VOLLEYBALL: "Volleyball",
  BASKETBALL: "Basketball",
  ATHLETICS: "Athletics",
  SWIMMING: "Swimming",
  BOXING: "Boxing",
  WRESTLING: "Wrestling",
  BADMINTON: "Badminton",
  TABLE_TENNIS: "Table Tennis",
  CYCLING: "Cycling",
  CHESS: "Chess",
};

import { prisma } from "@/lib/db";

export async function getDistrictAnalytics(district: string) {
  const [athleteCount, avgTalent, sportGroups, medalCount] = await Promise.all([
    prisma.athlete.count({ where: { district } }),
    prisma.athlete.aggregate({
      where: { district },
      _avg: { talentScore: true },
    }),
    prisma.athlete.groupBy({
      by: ["sport"],
      where: { district },
      _count: { sport: true },
      orderBy: { _count: { sport: "desc" } },
    }),
    prisma.result.count({
      where: { medal: { not: null }, athlete: { district } },
    }),
  ]);

  return {
    athleteCount,
    avgTalentScore: avgTalent._avg.talentScore ?? 0,
    medalCount,
    sportBreakdown: sportGroups.map((s) => ({
      sport: s.sport,
      count: s._count.sport,
    })),
  };
}

export const DISTRICT_LABELS: Record<string, string> = {
  NORTH_GOA: "North Goa",
  SOUTH_GOA: "South Goa",
  PANAJI: "Panaji",
  MARGAO: "Margao",
  VASCO: "Vasco",
  MAPUSA: "Mapusa",
  PONDA: "Ponda",
  BICHOLIM: "Bicholim",
  CANACONA: "Canacona",
  QUEPEM: "Quepem",
};
