import { Prisma } from "@prisma/client";
import { PrismaTx, prisma } from "../../common/libs/prisma";
import { CreateNotification, ListNotificationRepositoryParams } from "./notification.type";

const notificationSelect: Prisma.NotificationsSelect = {
  id: true,
  userId: true,
  type: true,
  title: true,
  message: true,
  isRead: true,
  createdAt: true,
  entityId: true,
  entityType: true,
  metadata: true,
};

export default {
  async listByUser(params: ListNotificationRepositoryParams) {
    const where: Prisma.NotificationsWhereInput = {
      userId: params.userId,
      ...(params.isRead !== undefined && { isRead: params.isRead }),
      ...(params.type && { type: params.type }),
    };

    const [newNotif, count, notifications] = await Promise.all([
      prisma.notifications.count({ where: { ...where, isRead: false } }),
      prisma.notifications.count({ where }),
      prisma.notifications.findMany({
        where,
        select: notificationSelect,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
    ]);

    return { count, notifications, newNotif };
  },

  async create(data: CreateNotification, db: PrismaTx = prisma) {
    return db.notifications.create({
      data,
    });
  },
  createMany: async (data: CreateNotification[], db: PrismaTx = prisma) => {
    return db.notifications.createMany({
      data,
    });
  },

  readAll: async (userId: number) =>
    prisma.notifications.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    }),
  readById: async ({ userId, notifId }: { userId: number; notifId: number }) =>
    prisma.notifications.update({
      where: { userId, id: notifId },
      data: {
        isRead: true,
      },
    }),
};
