// lib/services/archive-manager.ts — Event Archival & Storage Management
import { prisma } from "@/lib/db";

// ─── Archive Completed Events ────────────────────────────────────────────────
export async function archiveCompletedEvents(olderThanDays: number = 90): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const eventsToArchive = await prisma.tournament.findMany({
    where: {
      status: "COMPLETED",
      endDate: { lt: cutoff },
      archivedAt: null,
    },
    include: {
      results: { select: { athleteId: true, rank: true, medal: true, score: true } },
      venue: { select: { name: true } },
      _count: { select: { applications: true } },
    },
  });

  let archivedCount = 0;

  for (const event of eventsToArchive) {
    await prisma.$transaction(async (tx) => {
      // Create archive record
      await tx.eventArchive.create({
        data: {
          originalId: event.id,
          name: event.name,
          sport: event.sport,
          category: event.category,
          level: event.level,
          venueId: event.venueId,
          startDate: event.startDate,
          endDate: event.endDate,
          totalParticipants: event._count.applications,
          resultsJson: JSON.stringify(event.results),
          metadataJson: JSON.stringify({
            description: event.description,
            ageGroup: event.ageGroup,
            maxParticipants: event.maxParticipants,
            prizePool: event.prizePool,
            venueName: event.venue.name,
            budget: event.budget,
            sponsoredBy: event.sponsoredBy,
          }),
          archiveReason: "AUTO_ARCHIVE",
        },
      });

      // Mark tournament as archived
      await tx.tournament.update({
        where: { id: event.id },
        data: { archivedAt: new Date(), archiveReason: "AUTO_ARCHIVE" },
      });
    });

    archivedCount++;
  }

  return archivedCount;
}

// ─── Storage Statistics ──────────────────────────────────────────────────────
export interface StorageStats {
  totalAthletes: number;
  totalTournaments: number;
  activeTournaments: number;
  archivedTournaments: number;
  totalDocuments: number;
  totalDocumentSizeBytes: number;
  totalPerformanceRecords: number;
  totalChatMessages: number;
  totalAuditLogs: number;
  totalNotifications: number;
}

export async function getStorageStats(): Promise<StorageStats> {
  const [
    totalAthletes,
    totalTournaments,
    activeTournaments,
    archivedTournaments,
    totalDocuments,
    docSize,
    totalPerformanceRecords,
    totalChatMessages,
    totalAuditLogs,
    totalNotifications,
  ] = await Promise.all([
    prisma.athlete.count(),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: { in: ["PUBLISHED", "ONGOING"] } } }),
    prisma.eventArchive.count(),
    prisma.document.count(),
    prisma.document.aggregate({ _sum: { fileSize: true } }),
    prisma.performanceRecord.count(),
    prisma.diviChatMessage.count(),
    prisma.auditLog.count(),
    prisma.notification.count(),
  ]);

  return {
    totalAthletes,
    totalTournaments,
    activeTournaments,
    archivedTournaments,
    totalDocuments,
    totalDocumentSizeBytes: docSize._sum.fileSize || 0,
    totalPerformanceRecords,
    totalChatMessages,
    totalAuditLogs,
    totalNotifications,
  };
}

// ─── Cleanup Operations ─────────────────────────────────────────────────────
export async function cleanupReadNotifications(olderThanDays: number = 30): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const result = await prisma.notification.deleteMany({
    where: { isRead: true, createdAt: { lt: cutoff } },
  });
  return result.count;
}

export async function cleanupOldActivityLogs(olderThanDays: number = 180): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const result = await prisma.activityLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return result.count;
}

export async function cleanupInactiveChatSessions(olderThanDays: number = 90): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const result = await prisma.diviChatSession.deleteMany({
    where: { updatedAt: { lt: cutoff }, isActive: false },
  });
  return result.count;
}

// ─── Retention Policy ───────────────────────────────────────────────────────
export interface RetentionPolicy {
  archiveEventsAfterDays: number;
  cleanupNotificationsAfterDays: number;
  cleanupActivityLogsAfterDays: number;
  cleanupChatSessionsAfterDays: number;
  purgeArchivesAfterDays: number;
}

const DEFAULT_POLICY: RetentionPolicy = {
  archiveEventsAfterDays: 90,
  cleanupNotificationsAfterDays: 30,
  cleanupActivityLogsAfterDays: 180,
  cleanupChatSessionsAfterDays: 90,
  purgeArchivesAfterDays: 730, // 2 years
};

export async function getRetentionPolicy(): Promise<RetentionPolicy> {
  const config = await prisma.systemConfig.findUnique({
    where: { key: "retention_policy" },
  });

  if (config) {
    try {
      return { ...DEFAULT_POLICY, ...JSON.parse(config.value) };
    } catch {
      return DEFAULT_POLICY;
    }
  }
  return DEFAULT_POLICY;
}

export async function updateRetentionPolicy(policy: Partial<RetentionPolicy>): Promise<RetentionPolicy> {
  const current = await getRetentionPolicy();
  const updated = { ...current, ...policy };

  await prisma.systemConfig.upsert({
    where: { key: "retention_policy" },
    update: { value: JSON.stringify(updated) },
    create: { key: "retention_policy", value: JSON.stringify(updated), category: "RETENTION" },
  });

  return updated;
}

// ─── Full Cleanup Job ───────────────────────────────────────────────────────
export async function runCleanupJob(): Promise<{
  archivedEvents: number;
  cleanedNotifications: number;
  cleanedActivityLogs: number;
  cleanedChatSessions: number;
}> {
  const policy = await getRetentionPolicy();

  const [archivedEvents, cleanedNotifications, cleanedActivityLogs, cleanedChatSessions] =
    await Promise.all([
      archiveCompletedEvents(policy.archiveEventsAfterDays),
      cleanupReadNotifications(policy.cleanupNotificationsAfterDays),
      cleanupOldActivityLogs(policy.cleanupActivityLogsAfterDays),
      cleanupInactiveChatSessions(policy.cleanupChatSessionsAfterDays),
    ]);

  return { archivedEvents, cleanedNotifications, cleanedActivityLogs, cleanedChatSessions };
}
