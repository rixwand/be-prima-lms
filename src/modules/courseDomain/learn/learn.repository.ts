import { PrismaTx, prisma } from "../../../common/libs/prisma";
import { Ids } from "./learn.service";
import { quizAttemptAnswersEntity } from "./learn.type";

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
                publishedAt: { not: null },
                removedAt: null,
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

    return course;
    // return {
    //   ...course,
    //   sections: course.sections.map(({ items, ...section }) => ({
    //     ...section,
    //     lessons: items.map(item => ({
    //       id: item.id,
    //       title: item.title,
    //       slug: item.slug,
    //       isPreview: item.isPreview,
    //       durationSec: null,
    //       sectionId: section.id,
    //       position: item.position,
    //       leearnProgress: item.learnProgress,
    //     })),
    //   })),
    // };
  },

  async getLessonContent({ courseId, itemId, sectionId }: Ids) {
    const row = await prisma.sectionItem.findFirst({
      where: {
        id: itemId,
        sectionId,
        type: "LESSON",
        publishedAt: { not: null },
        removedAt: null,
        section: { courseId },
        lesson: { is: { contentLive: { not: {} } } },
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

  getQuizContent: async ({ courseId, itemId, sectionId }: Ids) => {
    const row = await prisma.sectionItem.findFirst({
      where: {
        sectionId,
        id: itemId,
        type: "QUIZ",
        publishedAt: { not: null },
        removedAt: null,
        section: { courseId },
        quiz: { is: { publishedData: { not: {} } } },
      },
      select: {
        quiz: {
          select: {
            publishedData: true,
          },
        },
      },
    });
    return row?.quiz?.publishedData ?? null;
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
  finishedQuizAttempt: async (
    id: number,
    data: {
      score: number;
      totalPoints: number;
      percentage: number;
      passed: boolean;
      timeSpentSecond: number;
    },
    db: PrismaTx = prisma,
  ) => {
    return db.quizAttempt.update({
      where: { id },
      data: {
        ...data,
        submittedAt: new Date(),
      },
      omit: {
        userId: true,
      },
    });
  },
  initializeQuizAttempt: async (
    data: { userId: number; quizId: number; snapshotId: number; attemptNumber: number; totalPoints: number },
    db: PrismaTx = prisma,
  ) => {
    return db.quizAttempt.create({
      data,
    });
  },
  getInProgressQuizAttempt: async ({ quizId, userId }: { userId: number; quizId: number }, db: PrismaTx = prisma) =>
    db.quizAttempt.findFirst({
      where: {
        userId,
        quizId,
        status: "IN_PROGRESS",
      },
    }),
  getNewAttemptNumber: async ({ quizId, userId }: { userId: number; quizId: number }, db: PrismaTx = prisma) => {
    const lastAttempt = await db.quizAttempt.findFirst({
      where: {
        userId,
        quizId,
      },
      orderBy: {
        attemptNumber: "desc",
      },
      select: {
        attemptNumber: true,
      },
    });

    const attemptNumber = (lastAttempt?.attemptNumber ?? 0) + 1;
    return attemptNumber;
  },
  abandonQuizAttempt: async ({ attemptId }: { attemptId: number }, db: PrismaTx = prisma) =>
    db.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "ABANDONED",
      },
    }),

  createManyQuizAttemptAnswer: async (data: quizAttemptAnswersEntity, db: PrismaTx = prisma) =>
    db.quizAttemptAnswer.createManyAndReturn({ data, omit: { correctOptionIds: true } }),
};
