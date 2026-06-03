import { prisma } from "../../../common/libs/prisma";
import { Ids } from "./learn.service";

export default {
  async getCurriculum(id: number) {
    const course = await prisma.course.findUnique({
      where: { id, takenDownAt: null, publishedAt: { not: null } },
      select: {
        metaApproved: true,
        sections: {
          where: { publishedAt: { not: null } },
          orderBy: { position: "asc" },
          select: {
            id: true,
            courseId: true,
            title: true,
            position: true,
            items: {
              where: {
                type: "LESSON",
                publishedAt: { not: null },
                removedAt: null,
                lesson: { isNot: null },
              },
              orderBy: { position: "asc" },
              include: {
                learnProgress: { select: { status: true } },
              },
            },
          },
        },
      },
    });

    if (!course) return null;

    return {
      ...course,
      sections: course.sections.map(({ items, ...section }) => ({
        ...section,
        lessons: items.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          isPreview: item.isPreview,
          durationSec: null,
          sectionId: section.id,
          position: item.position,
          leearnProgress: item.learnProgress,
        })),
      })),
    };
  },

  async getLessonContent({ courseId, lessonId, sectionId }: Ids) {
    const row = await prisma.sectionItem.findFirst({
      where: {
        sectionId,
        type: "LESSON",
        publishedAt: { not: null },
        removedAt: null,
        section: { courseId },
        lesson: { is: { id: lessonId } },
      },
      select: {
        lesson: {
          select: {
            contentLive: true,
          },
        },
      },
    });

    return row?.lesson ?? null;
  },

  async startCourse({ courseId, userId }: { courseId: number; userId: number }) {
    return prisma.$transaction(
      async tx => {
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

        const nextItem = await tx.sectionItem.findFirst({
          where: {
            type: "LESSON",
            publishedAt: { not: null },
            removedAt: null,
            section: { courseId },
            learnProgress: {
              some: {
                enrollmentId: enrollment.id,
                status: { not: "COMPLETED" },
              },
            },
          },
          orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
          select: { slug: true },
        });

        if (!nextItem) {
          return tx.sectionItem.findFirst({
            where: {
              type: "LESSON",
              publishedAt: { not: null },
              removedAt: null,
              section: { courseId },
              learnProgress: {
                some: {
                  enrollmentId: enrollment.id,
                },
              },
            },
            orderBy: [{ section: { position: "desc" } }, { position: "desc" }],
            select: { slug: true },
          });
        }

        return nextItem;
      },
      { timeout: 30000 },
    );
  },
};
