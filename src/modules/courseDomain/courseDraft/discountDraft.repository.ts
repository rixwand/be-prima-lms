import { prisma } from "../../../common/libs/prisma";
import { IUpdateDiscount } from "../courseDiscountDraft/courseDiscount.types";

export const discountDraftRepo = {
  upsert: async ({
    discount,
    draftId,
    requiresApproval,
  }: {
    discount: IUpdateDiscount;
    draftId: number;
    requiresApproval?: boolean;
  }) => {
    const { id, ...data } = discount;
    if (id) {
      return prisma.courseDraftDiscount.update({
        where: { id, draftId },
        data: {
          ...data,
          ...(typeof requiresApproval == "boolean" && { draft: { update: { requiresApproval } } }),
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
