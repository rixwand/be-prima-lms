import notificationRepository from "./notification.repository";
import { ListNotificationParams } from "./notification.type";

const listByUser = async (userId: number, params: ListNotificationParams) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const { count, notifications } = await notificationRepository.listByUser({
    userId,
    isRead: params.isRead,
    type: params.type,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    notifications,
    meta: {
      total: count,
      page,
      limit,
      totalPage: Math.ceil(count / limit),
    },
  };
};

export default {
  listByUser,
};
