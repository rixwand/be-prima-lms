import { Enrollment } from "@prisma/client";
import { PrismaTx, prisma } from "../../../common/libs/prisma";

export default {
  async create({ courseId, enrollmentId }: { courseId: number; enrollmentId: string }, db: PrismaTx = prisma) {
    const lessons = await db.lesson.findMany({
      where: { section: { course: { id: courseId, publishedAt: { not: null } } }, publishedAt: { not: null } },
      orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
      select: { id: true },
    });

    return db.lessonProgress.createMany({
      data: lessons.map(({ id }, i) => ({
        enrollmentId,
        lessonId: id,
        status: i == 0 ? "CURRENT" : "PENDING",
      })),
    });
  },
  async createPublished({ courseId, lessonId }: { lessonId: number; courseId: number }, db: PrismaTx = prisma) {
    const enrollments = await db.enrollment.findMany({ where: { courseId }, select: { id: true } });
    if (!enrollments || enrollments.length == 0) return;
    return this.createManyWithEnrollments({ lessonId, enrollments }, db);
  },

  async createPublishedSection(
    { courseId, sectionId }: { courseId: number; sectionId: number },
    db: PrismaTx = prisma,
  ) {
    const enrollments = await db.enrollment.findMany({ where: { courseId }, select: { id: true } });
    if (!enrollments || enrollments.length == 0) return;
    const lessons = await db.lesson.findMany({ where: { sectionId, publishedAt: { not: null } } });
    if (!lessons || lessons.length == 0) return;
    for (const lesson of lessons) {
      await this.createManyWithEnrollments({ enrollments, lessonId: lesson.id }, db);
    }
  },
  async createManyWithEnrollments(
    { enrollments, lessonId }: { lessonId: number; enrollments: Pick<Enrollment, "id">[] },
    db: PrismaTx = prisma,
  ) {
    return db.lessonProgress.createMany({
      data: enrollments.map(({ id }) => ({
        enrollmentId: id,
        lessonId,
        status: "PENDING",
      })),
    });
  },
};
