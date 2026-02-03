import { prisma } from "../../../common/libs/prisma";

export default {
  async getCategoriesDraft(draftId: number) {
    return prisma.courseDraftCategory.findMany({ where: { draftId }, omit: { draftId: true } });
  },
};
