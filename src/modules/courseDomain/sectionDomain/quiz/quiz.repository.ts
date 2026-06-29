import { Prisma } from "@prisma/client";
import { InputJsonValue, JsonValue } from "@prisma/client/runtime/library";
import { PrismaTransaction, PrismaTx, prisma } from "../../../../common/libs/prisma";
import { withTransaction } from "../../../../common/libs/prisma/transaction";
import { optionalizeUndefined } from "../../../../common/utils/function";
import { ICreateQestionSchema, IQuizPublishedSnapshot, IUpdateQestionSchema, IUpdateQuizSchema } from "./quiz.types";

const quizRepository = {
  update: async (
    sectionItemId: number,
    {
      description,
      publishedData,
      topics,
      passingScorePercent,
    }: Omit<IUpdateQuizSchema, "questions"> & { publishedData?: IQuizPublishedSnapshot },
    db: PrismaTx = prisma,
  ) => {
    return db.quiz.update({
      where: { sectionItemId },
      data: {
        ...(passingScorePercent && { passingScorePercent }),
        ...(topics && topics.length > 0 && { topics }),
        ...(description && { description }),
        ...(publishedData && { publishedData }),
      },
    });
  },

  getQuizAttemptById: async ({ attemptId, userId }: { attemptId: number; userId: number }, db: PrismaTx = prisma) =>
    db.quizAttempt.findUnique({
      where: { id: attemptId, userId },
      include: {
        snapshot: true,
      },
    }),
  createQuestions: async (quizId: number, questions: ICreateQestionSchema[], dbTx?: PrismaTransaction) => {
    const run = (tx: PrismaTransaction) =>
      Promise.all(
        questions.map(({ options, question, position }) =>
          tx.quizQuestion.create({
            data: {
              quizId,
              question,
              position,
              options: {
                createMany: {
                  data: options.map((option, i) => ({
                    position: i + 1,
                    ...option,
                  })),
                },
              },
            },
          }),
        ),
      );

    return dbTx ? run(dbTx) : withTransaction(tx => run(tx));
  },

  updateQuestions: async (quizId: number, questions: IUpdateQestionSchema[], dbTx?: PrismaTransaction) => {
    const uq = (tx: PrismaTransaction) =>
      Promise.all(
        questions.map(async ({ id, options, ...q }) => {
          if (options) {
            await tx.quizOption.deleteMany({
              where: { questionId: id },
            });
          }

          return tx.quizQuestion.update({
            where: { id, quizId },
            data: {
              ...optionalizeUndefined(q),

              ...(options && {
                options: {
                  createMany: {
                    data: options.map((o, i) => ({
                      position: i + 1,
                      ...o,
                    })),
                  },
                },
              }),
            },
          });
        }),
      );

    return dbTx ? uq(dbTx) : withTransaction(tx => uq(tx));
  },

  listQuestionPositions: async (quizId: number, db: PrismaTx = prisma) => {
    return db.quizQuestion.findMany({
      where: { quizId },
      select: { id: true, position: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
  },

  updateQuestionPositions: async (
    quizId: number,
    questions: { id: number; position: number }[],
    db: PrismaTx = prisma,
  ) => {
    if (!questions.length) return;

    const { _max } = await db.quizQuestion.aggregate({
      where: { quizId },
      _max: { position: true },
    });
    const offset = (_max.position ?? 0) + questions.length + 1;

    await db.quizQuestion.updateMany({
      where: { quizId, id: { in: questions.map(question => question.id) } },
      data: { position: { increment: offset } },
    });

    for (const question of questions) {
      await db.quizQuestion.updateMany({
        where: { quizId, id: question.id },
        data: { position: question.position },
      });
    }
  },

  compactQuestionPositions: async (quizId: number, db: PrismaTx = prisma) => {
    const questions = await quizRepository.listQuestionPositions(quizId, db);
    const compacted = questions.map((question, index) => ({ id: question.id, position: index + 1 }));
    await quizRepository.updateQuestionPositions(quizId, compacted, db);
    return compacted;
  },

  findQuizBySectionItemId: async <T extends Omit<Prisma.QuizFindUniqueArgs, "where">>(
    sectionItemId: number,
    args?: T,
    db: PrismaTx = prisma,
  ): Promise<Prisma.QuizGetPayload<T> | null> => {
    return db.quiz.findUnique({
      where: {
        sectionItemId,
      },
      ...(args ?? {}),
    } as Prisma.QuizFindUniqueArgs) as Promise<Prisma.QuizGetPayload<T> | null>;
  },
  deleteQuestionByIdAndItemsId: async (
    { itemId, questionId }: { itemId: number; questionId: number },
    db: PrismaTx = prisma,
  ) => {
    return db.quizQuestion.delete({
      where: { id: questionId, quiz: { sectionItemId: itemId } },
    });
  },
  deleteManyQuestionByIdAndItemsId: async (
    { itemId, questionIds }: { itemId: number; questionIds: number[] },
    db: PrismaTx = prisma,
  ) => {
    return db.quizQuestion.deleteMany({
      where: { id: { in: questionIds }, quiz: { sectionItemId: itemId } },
    });
  },
  getCurrentPublishedVersion: async ({ itemId, sectionId }: { itemId: number; sectionId: number }) => {
    const item = await prisma.sectionItem.findUnique({
      where: { id: itemId, sectionId },
      select: {
        quiz: {
          select: {
            id: true,
            publishedVersion: true,
            publishedData: true,
          },
        },
      },
    });
    return item?.quiz ?? null;
  },
  getOrCreateSnapshot: async ({
    publishedVersion,
    quizId,
    publishedData,
  }: {
    quizId: number;
    publishedVersion: number;
    publishedData: JsonValue;
  }) =>
    await prisma.quizSnapshot.upsert({
      where: {
        quizId_publishedVersion: {
          quizId,
          publishedVersion,
        },
      },
      update: {},
      create: {
        quizId,
        publishedVersion,
        data: publishedData as InputJsonValue,
      },
    }),
};

export default quizRepository;
