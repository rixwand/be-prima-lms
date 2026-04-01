import { Prisma } from "@prisma/client";
import { prisma } from "../../common/libs/prisma";
import { ListNotificationRepositoryParams } from "./notification.type";

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

const listByUser = async (params: ListNotificationRepositoryParams) => {
  const where: Prisma.NotificationsWhereInput = {
    userId: params.userId,
    ...(params.isRead !== undefined && { isRead: params.isRead }),
    ...(params.type && {
      type: {
        contains: params.type,
        mode: "insensitive",
      },
    }),
  };

  const [count, notifications] = await Promise.all([
    prisma.notifications.count({ where }),
    prisma.notifications.findMany({
      where,
      select: notificationSelect,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return { count, notifications };
};

export default {
  listByUser,
};
