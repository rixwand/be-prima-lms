import { isDeepStrictEqual } from "util";
import { PrismaTransaction } from "../../../../common/libs/prisma";
import { withTransaction } from "../../../../common/libs/prisma/transaction";
import { ApiError } from "../../../../common/utils/http";
import { sectionItemRepo } from "../sectionItem/sectionItem.repository";
import quizRepository from "./quiz.repository";
import { ICreateQestionSchema, IUpdateQestionSchema, IUpdateQuizSchema } from "./quiz.types";

type QuestionPositionRow = { id: number; position: number };

function applyQuestionOrder({
  existingQuestions,
  positionedQuestions,
  totalQuestions,
}: {
  existingQuestions: QuestionPositionRow[];
  positionedQuestions: QuestionPositionRow[];
  totalQuestions: number;
}) {
  const maxRequestedPosition = positionedQuestions.reduce((max, question) => Math.max(max, question.position), 0);
  if (maxRequestedPosition > totalQuestions) {
    throw new ApiError(400, "Requested positions exceed total quiz questions");
  }

  const placement: ({ id: number } | null)[] = Array.from({ length: totalQuestions }, () => null);
  const positionedIds = new Set(positionedQuestions.map(question => question.id));
  const remainingExistingQuestions = existingQuestions.filter(question => !positionedIds.has(question.id));

  for (const question of positionedQuestions) {
    const index = question.position - 1;
    if (placement[index]) throw new ApiError(400, "Duplicate quiz question position detected");
    placement[index] = { id: question.id };
  }

  let remainingIndex = 0;
  for (let i = 0; i < placement.length; i++) {
    if (placement[i]) continue;
    const nextQuestion = remainingExistingQuestions[remainingIndex];
    if (!nextQuestion) throw new ApiError(400, "Question reorder payload is invalid");
    placement[i] = { id: nextQuestion.id };
    remainingIndex += 1;
  }

  return placement.map((question, index) => ({ id: question!.id, position: index + 1 }));
}

function deleteQuestions(
  questionId: number,
  itemId: number,
): ReturnType<typeof quizRepository.deleteQuestionByIdAndItemsId>;

function deleteQuestions(
  questionId: number[],
  itemId: number,
): ReturnType<typeof quizRepository.deleteManyQuestionByIdAndItemsId>;

async function deleteQuestions(questionId: number | number[], itemId: number) {
  return withTransaction(async tx => {
    const quiz = await quizRepository.findQuizBySectionItemId(itemId, undefined, tx);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    const result =
      typeof questionId === "number"
        ? await quizRepository.deleteQuestionByIdAndItemsId(
            {
              questionId,
              itemId,
            },
            tx,
          )
        : await quizRepository.deleteManyQuestionByIdAndItemsId(
            {
              itemId,
              questionIds: questionId,
            },
            tx,
          );

    await quizRepository.compactQuestionPositions(quiz.id, tx);
    return result;
  });
}

export default {
  get: async (sectionItemId: number) => {
    return quizRepository.findQuizBySectionItemId(sectionItemId, {
      include: { questions: { include: { options: { omit: { questionId: true, id: true } } } } },
    });
  },

  update: async (updateQuiz: IUpdateQuizSchema, sectionItemId: number, extTx?: PrismaTransaction) => {
    if (Object.keys(updateQuiz).length == 0) throw new ApiError(400, "Invalid request body");
    const quiz = await quizRepository.findQuizBySectionItemId(sectionItemId, undefined, extTx);
    if (!quiz) throw new ApiError(404, "Quiz not found");
    const executor = async (tx: PrismaTransaction) => {
      if (updateQuiz.description) {
        await quizRepository.update(
          sectionItemId,
          {
            description: updateQuiz.description,
          },
          tx,
        );
      }
      if (updateQuiz.questions) {
        const existingQuestions = await quizRepository.listQuestionPositions(quiz.id, tx);
        const existingQuestionIds = new Set(existingQuestions.map(question => question.id));
        const updateQuestions: IUpdateQestionSchema[] = [];
        const createQuestions: ICreateQestionSchema[] = [];
        for (const q of updateQuiz.questions) {
          if (!q) continue;
          if ("id" in q) {
            if (!existingQuestionIds.has(q.id)) throw new ApiError(404, `Quiz question ${q.id} not found`);
            updateQuestions.push(q);
          } else createQuestions.push(q);
        }
        const positionedUpdates = updateQuestions
          .filter(question => question.position !== undefined)
          .map(question => ({ id: question.id, position: question.position! }));
        if (updateQuestions.length > 0) {
          await quizRepository.updateQuestions(
            quiz.id,
            updateQuestions.map(({ position, ...question }) => question),
            tx,
          );
        }
        const maxExistingPosition = existingQuestions.reduce((max, question) => Math.max(max, question.position), 0);
        if (createQuestions.length > 0) {
          const questionsToCreate = createQuestions.map((question, index) => ({
            ...question,
            position: maxExistingPosition + index + 1,
          }));
          const createdQuestions = await quizRepository.createQuestions(quiz.id, questionsToCreate, tx);
          const positionedCreates = createdQuestions.map((question, index) => ({
            id: question.id,
            position: createQuestions[index]!.position,
          }));
          const finalOrder = applyQuestionOrder({
            existingQuestions,
            positionedQuestions: [...positionedUpdates, ...positionedCreates],
            totalQuestions: existingQuestions.length + createdQuestions.length,
          });
          await quizRepository.updateQuestionPositions(quiz.id, finalOrder, tx);
        } else if (positionedUpdates.length > 0) {
          const finalOrder = applyQuestionOrder({
            existingQuestions,
            positionedQuestions: positionedUpdates,
            totalQuestions: existingQuestions.length,
          });
          await quizRepository.updateQuestionPositions(quiz.id, finalOrder, tx);
        }
      }
      return "update success";
    };
    if (extTx) {
      return executor(extTx);
    }
    return withTransaction(executor);
  },

  async publish(sectionItemId: number, updateQuiz?: IUpdateQuizSchema) {
    return withTransaction(async tx => {
      console.log(updateQuiz, " update quiz data");
      if (updateQuiz) {
        const res = await this.update(updateQuiz, sectionItemId, tx);
        console.log(res);
      }
      const data = await quizRepository.findQuizBySectionItemId(
        sectionItemId,
        {
          include: {
            questions: {
              omit: { quizId: true, id: true },
              include: { options: { omit: { id: true, questionId: true } } },
            },
          },
          omit: { id: true, sectionItemId: true },
        },
        tx,
      );
      if (!data) throw new ApiError(404, "Quiz not found");
      const { publishedData, ...payload } = data;
      console.log(JSON.stringify(payload, null, 2), " Published payload");
      if (isDeepStrictEqual(publishedData, payload)) return "Content live is already up to date";
      await quizRepository.update(
        sectionItemId,
        {
          publishedData: payload,
        },
        tx,
      );
      await sectionItemRepo.update(sectionItemId, { publishedAt: new Date() }, tx);
      return "Publish draft content is success";
    });
  },
  deleteQuestions,
};
