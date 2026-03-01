import { prisma } from "../../../common/libs/prisma";
import { Ids } from "./learn.service";

export default {
  async getCurriculum(id: number) {
    return prisma.course.findUnique({
      where: { id, takenDownAt: null, publishedAt: { not: null } },
      select: {
        metaApproved: true,
        sections: {
          where: { publishedAt: { not: null } },
          orderBy: { position: "asc" },
          include: {
            lessons: {
              where: { publishedAt: { not: null } },
              orderBy: { position: "asc" },
              select: {
                id: true,
                isPreview: true,
                slug: true,
                sectionId: true,
                title: true,
                durationSec: true,
                lessonProgress: { select: { status: true } },
              },
            },
          },
        },
      },
    });
  },
  async getLessonContent({ courseId, lessonId, sectionId }: Ids) {
    return prisma.lesson.findUnique({
      where: { sectionId, section: { courseId }, id: lessonId },
      select: { contentLive: true },
    });
  },

  async startCourse({ courseId, userId }: { courseId: number; userId: number }) {
    return prisma.$transaction(async tx => {
      // Get enrollment
      const enrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        select: { id: true },
      });

      if (!enrollment) throw new Error("Not enrolled");

      //  Find first NOT completed lesson
      const nextLesson = await tx.lesson.findFirst({
        where: {
          section: { courseId },
          lessonProgress: {
            some: {
              enrollmentId: enrollment.id,
              status: { not: "COMPLETED" },
            },
          },
        },
        orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
        select: { slug: true },
      });

      // If everything completed → open last lesson
      if (!nextLesson) {
        return tx.lesson.findFirst({
          where: {
            section: { courseId },
          },
          orderBy: [{ section: { position: "desc" } }, { position: "desc" }],
          select: { slug: true },
        });
      }

      return nextLesson;
    });
  },
};
