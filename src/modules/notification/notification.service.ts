import { PrismaTx } from "../../common/libs/prisma";
import { AUTH } from "../../config";
import { userRepo } from "../users/user.repository";
import notificationRepository from "./notification.repository";
import { CreateNotification, ListNotificationParams } from "./notification.type";

async function readNotification(args: {
  id: number;
  userId: number;
}): Promise<Awaited<ReturnType<typeof notificationRepository.readById>>>;
async function readNotification(args: {
  id: "all";
  userId: number;
}): Promise<Awaited<ReturnType<typeof notificationRepository.readAll>>>;
async function readNotification({ id, userId }: { id: number | "all"; userId: number }) {
  if (typeof id === "number") {
    return notificationRepository.readById({ userId, notifId: id });
  } else {
    return notificationRepository.readAll(userId);
  }
}

export default {
  async listByUser(userId: number, params: ListNotificationParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    const { count, notifications, newNotif } = await notificationRepository.listByUser({
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
        newNotif,
      },
    };
  },

  createAdminNoification: async (data: Omit<CreateNotification, "userId">, tx?: PrismaTx) => {
    try {
      const admins = await userRepo.findByRole(AUTH.ROLES.ADMIN, tx);
      return notificationRepository.createMany(
        admins.map(admin => ({
          userId: admin.id,
          ...data,
        })),
        tx,
      );
    } catch (err) {
      console.log("create notification error: ", err);
    }
  },

  async createUserNotfication(data: CreateNotification, tx?: PrismaTx) {
    try {
      const notif = await notificationRepository.create(data, tx);
    } catch (err) {
      console.log("create notification error: ", err);
    }
  },

  readNotification,
};
