import { Prisma } from "@prisma/client";
import { PrismaTx, prisma } from "../../../common/libs/prisma";
import { ApiError } from "../../../common/utils/http";

const courseDraftRepo = {
  async updateMeta(course: Prisma.CourseMetaDraftUpdateInput, id: number, db: PrismaTx = prisma) {
    return db.courseMetaDraft.update({
      where: { id },
      data: course,
    });
  },

  async publishMeta(courseId: number, db: PrismaTx = prisma) {
    const metaDraft = await db.courseMetaDraft.findUnique({ where: { courseId }, omit: { id: true, courseId: true } });
    if (!metaDraft) throw new ApiError(404, "Course Meta Draft not found");
    return db.courseMetaApproved.upsert({
      where: { courseId },
      create: {
        courseId,
        approvedAt: new Date(),
        payload: metaDraft,
      },
      update: {
        payload: metaDraft,
      },
    });
  },

  async getMetaB(courseId: number) {
    return prisma.courseMetaDraft.findUnique({
      where: { courseId },
      select: { coverImage: true, title: true, shortDescription: true, descriptionJson: true, previewVideo: true },
    });
  },

  async getMetaC(courseId: number) {
    return prisma.courseMetaDraft.findUnique({
      where: { courseId },
      select: {
        id: true,
        isFree: true,
        priceAmount: true,
        draftDiscounts: true,
        draftTags: { select: { tagId: true } },
        draftCategories: true,
      },
    });
  },

  async isRequiresApproval(courseId: number) {
    const res = await prisma.courseMetaDraft.findUnique({
      where: { courseId },
      select: { requiresApproval: true },
    });
    return res?.requiresApproval;
  },
};

export default courseDraftRepo;
