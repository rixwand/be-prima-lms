import { prisma } from "../../../common/libs/prisma";
import { IUpdateDiscount } from "../courseDiscountDraft/courseDiscount.types";

export const discountDraftRepo = {
  upsert: async ({ discount, draftId }: { discount: IUpdateDiscount; draftId: number }) => {
    const { id, ...data } = discount;
    if (id) {
      return prisma.courseDraftDiscount.update({
        where: { id, draftId },
        data: {
          ...data,
        },
      });
    } else {
      return prisma.courseDraftDiscount.create({
        data: {
          draftId,
          ...data,
        },
      });
    }
  },

  remove: async ({ draftId, id }: { id: number; draftId: number }) =>
    prisma.courseDraftDiscount.delete({ where: { id, draftId } }),

  get: async (draftId: number) => prisma.courseDraftDiscount.findMany({ where: { draftId } }),
};
