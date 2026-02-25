import { $Enums } from "@prisma/client";
import { PrismaTx, prisma } from "../../common/libs/prisma";

export default {
  async create(data: { userId: number; courseId: number; amount: number }, db: PrismaTx = prisma) {
    return db.order.create({
      data,
    });
  },

  async get(id: string, db: PrismaTx = prisma) {
    return db.order.findUnique({ where: { id } });
  },

  async update(id: string, data: { xenditId?: string; status?: $Enums.OrderStatus }, db: PrismaTx = prisma) {
    return db.order.update({
      where: { id },
      data,
    });
  },
};
