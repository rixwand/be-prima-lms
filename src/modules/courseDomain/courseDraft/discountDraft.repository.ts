import { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { IUpdateDiscount } from "../courseDiscount/courseDiscount.types";
import courseDraftRepo from "./courseDraft.repository";

export const discountDraftRepo = {
  upsert: async (discount: IUpdateDiscount, draftId: number) => {
    const { id, ...data } = discount;
    return prisma.courseDraftDiscount.update({
      where: { id, draftId },
      data,
    });
  },

  remove: async ({ draftId, id }: { id: number; draftId: number }) =>
    prisma.courseDraftDiscount.delete({ where: { id, draftId } }),

  async ensureDiscountDraft(courseId: number, tx?: Prisma.TransactionClient) {
    const dbClient = tx || prisma;
    const draft = await courseDraftRepo.upsertMeta({ courseId });

    const existingDraftCount = await dbClient.courseDraftDiscount.count({
      where: { draftId: draft.id },
    });

    if (existingDraftCount > 0) {
      return draft.id;
    }

    const publishedDiscounts = await dbClient.courseDiscount.findMany({
      where: { courseId },
    });

    if (publishedDiscounts.length === 0) {
      return draft.id;
    }

    await dbClient.courseDraftDiscount.createMany({
      data: publishedDiscounts.map(d => ({
        id: d.id,
        draftId: draft.id,
        type: d.type,
        value: d.value,
        startAt: d.startAt,
        endAt: d.endAt,
        isActive: d.isActive,
        label: d.label,
      })),
    });

    return draft.id;
  },
};
