// lib/services/notification-service.ts — Centralized Notification Service
import { prisma } from "@/lib/db";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM";

export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "INFO",
  linkUrl?: string
) {
  return prisma.notification.create({
    data: { userId, title, message, type, linkUrl },
  });
}

export async function notifyRole(
  role: string,
  title: string,
  message: string,
  type: NotificationType = "INFO",
  linkUrl?: string
) {
  const users = await prisma.user.findMany({
    where: { role, isActive: true },
    select: { id: true },
  });

  if (users.length === 0) return 0;

  const result = await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title,
      message,
      type,
      linkUrl,
    })),
  });

  return result.count;
}

export async function notifyMultipleUsers(
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType = "INFO",
  linkUrl?: string
) {
  const result = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title,
      message,
      type,
      linkUrl,
    })),
  });
  return result.count;
}

export async function markAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    notifications,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}
