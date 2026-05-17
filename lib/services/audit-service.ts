// lib/services/audit-service.ts — Audit Trail Logging
import { prisma } from "@/lib/db";

export async function logAction(
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  details?: string,
  ipAddress?: string
) {
  return prisma.auditLog.create({
    data: { actorId, action, targetType, targetId, details, ipAddress },
  });
}

export interface AuditTrailFilters {
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export async function getAuditTrail(filters: AuditTrailFilters = {}) {
  const { actorId, action, targetType, targetId, startDate, endDate, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (actorId) where.actorId = actorId;
  if (action) where.action = action;
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = targetId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        actor: { select: { email: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRecentActions(userId: string, limit: number = 10) {
  return prisma.auditLog.findMany({
    where: { actorId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
