import { $Enums, Prisma } from "@prisma/client";
import { PrismaTx, prisma } from "../../../common/libs/prisma";
import { ApiError } from "../../../common/utils/http";

const courseDraftRepo = {
  async updateMeta(course: Prisma.CourseMetaDraftUpdateInput, id: number, tx?: Prisma.TransactionClient) {
    if (tx) {
      return updateMetaFn(course, id, tx);
    } else {
      return prisma.$transaction(async tx => updateMetaFn(course, id, tx), { timeout: 30000 });
    }
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

  async addApprovalField(target: $Enums.ApprovalTarget, id: number, tx: Prisma.TransactionClient) {
    console.log("addApprovalField", target);
    return tx.$executeRaw`
      UPDATE course_meta_drafts
      SET "requiresApproval" =
        CASE
          WHEN NOT ${target}::"ApprovalTarget" = ANY("requiresApproval")
          THEN array_append("requiresApproval", ${target}::"ApprovalTarget")
          ELSE"requiresApproval"
        END
      WHERE id = ${id}
      `;
  },
  async removeApprovalField(target: $Enums.ApprovalTarget, id: number, tx: Prisma.TransactionClient) {
    console.log("remove", target);
    return tx.$executeRaw`
      UPDATE course_meta_drafts
      SET "requiresApproval" = array_remove("requiresApproval", ${target}::"ApprovalTarget")
      WHERE id = ${id}
    `;
  },
};

export default courseDraftRepo;

const updateMetaFn = async (course: Prisma.CourseMetaDraftUpdateInput, id: number, db: Prisma.TransactionClient) => {
  if (course.requiresApproval) {
    await db.coursePublishRequest.updateMany({
      where: { id, status: { not: "APPROVED" } },
      data: { status: "APPROVED" },
    });
  }
  return db.courseMetaDraft.update({
    where: { id },
    data: course,
  });
};
