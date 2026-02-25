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
};
