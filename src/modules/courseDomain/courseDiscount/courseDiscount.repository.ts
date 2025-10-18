import { prisma } from "../../../common/libs/prisma";
import { IUpdateDiscount } from "./courseDiscount.types";

export const discountRepo = {
  update: async (discount: IUpdateDiscount, courseId: number) => {
    const { id, ...data } = discount;
    if (id) {
      return prisma.courseDiscount.update({
        where: { id },
        data,
      });
    } else {
      return prisma.courseDiscount.create({
        data: { ...data, courseId },
      });
    }
  },

  remove: async ({ courseId, id }: { id: number; courseId: number }) =>
    prisma.courseDiscount.delete({ where: { id, courseId } }),
};
