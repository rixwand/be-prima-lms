import { prisma } from "../../../common/libs/prisma";
import { IUpdateDiscount } from "./courseDiscount.types";

export const discountRepo = {
  upsert: async (discount: IUpdateDiscount, courseId: number) => {
    const { id, ...data } = discount;
    return prisma.courseDiscount.upsert({
      where: { id },
      update: data,
      create: { ...data, courseId },
    });
  },

  remove: async ({ courseId, id }: { id: number; courseId: number }) =>
    prisma.courseDiscount.delete({ where: { id, courseId } }),
};
