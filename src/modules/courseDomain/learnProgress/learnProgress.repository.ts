import { Enrollment } from "@prisma/client";
import { PrismaTx, prisma } from "../../../common/libs/prisma";
import { ApiError } from "../../../common/utils/http";

export default {
  async create({ courseId, enrollmentId }: { courseId: number; enrollmentId: string }, db: PrismaTx = prisma) {
    const rows = await db.sectionItem.findMany({
      where: {
        publishedAt: { not: null },
        removedAt: null,
        section: { course: { id: courseId, publishedAt: { not: null } } },
      },
      orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
      select: {
        id: true,
      },
    });

    return db.learnProgress.createMany({
      data: rows.map(({ id }) => ({
        enrollmentId,
        sectionItemId: id,
        status: "PENDING",
      })),
    });
  },

  async createPublished(
    { courseId, sectionItemId }: { sectionItemId: number; courseId: number },
    db: PrismaTx = prisma,
  ) {
    const enrollments = await db.enrollment.findMany({ where: { courseId }, select: { id: true } });
    if (!enrollments || enrollments.length === 0) return;
    return this.createManyWithEnrollments({ sectionItemId, enrollments }, db);
  },

  async createPublishedSection(
    { courseId, sectionId }: { courseId: number; sectionId: number },
    db: PrismaTx = prisma,
  ) {
    const enrollments = await db.enrollment.findMany({ where: { courseId }, select: { id: true } });
    if (!enrollments || enrollments.length === 0) return;

    const rows = await db.sectionItem.findMany({
      where: {
        sectionId,
        publishedAt: { not: null },
        removedAt: null,
      },
      select: {
        id: true,
      },
    });

    for (const { id } of rows) {
      await this.createManyWithEnrollments({ enrollments, sectionItemId: id }, db);
    }
  },

  async createManyWithEnrollments(
    { enrollments, sectionItemId }: { sectionItemId: number; enrollments: Pick<Enrollment, "id">[] },
    db: PrismaTx = prisma,
  ) {
    return db.learnProgress.createMany({
      data: enrollments.map(({ id }) => ({
        enrollmentId: id,
        sectionItemId,
        status: "PENDING",
      })),
      skipDuplicates: true,
    });
  },

  async lessonComplete(
    { enrollmentId, sectionItemId }: { enrollmentId: string; sectionItemId: number },
    db: PrismaTx = prisma,
  ) {
    const lp = await db.learnProgress.findUnique({
      where: { sectionItemId_enrollmentId: { enrollmentId, sectionItemId } },
    });
    if (!lp) throw new ApiError(404, "lesson progress not found");
    if (lp.status === "COMPLETED") return lp;
    return db.learnProgress.update({
      where: { sectionItemId_enrollmentId: { enrollmentId, sectionItemId }, status: "PENDING" },
      data: { status: "COMPLETED" },
    });
  },
};
