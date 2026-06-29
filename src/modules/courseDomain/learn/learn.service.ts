import { PrismaTransaction } from "../../../common/libs/prisma";
import { withTransaction } from "../../../common/libs/prisma/transaction";
import { ApiError } from "../../../common/utils/http";
import { MetaApprovedPayload } from "../course/course.types";
import enrollmentRepository from "../enrollment/enrollment.repository";
import lessonProgressRepository from "../learnProgress/learnProgress.repository";
import quizRepository from "../sectionDomain/quiz/quiz.repository";
import learnRepository from "./learn.repository";
import {
  StartedQuizSnapshot,
  StartedQuizSnapshotWithoutAnswers,
  SubmittedAnswers,
  quizAttemptAnswersEntity,
} from "./learn.type";
import { ItemType } from "./learn.validation";

export type Ids = { courseId: number; sectionId: number; itemId: number };

const learnService = {
  async getCurriculum(courseId: number) {
    const course = await learnRepository.getCurriculum(courseId);
    if (!course) throw new ApiError(404, "Course Not Found");
    const { metaApproved, sections } = course;
    sections.every(s => console.log(s.items));
    return { title: (metaApproved?.payload as unknown as MetaApprovedPayload).title, sections };
  },
  getItemContent: async (props: Ids, type: ItemType) => {
    const content =
      type == "lesson" ? await learnRepository.getLessonContent(props) : await learnRepository.getQuizContent(props);
    if (!content) throw new ApiError(404, "Lesson Not Found");
    return content;
  },
  async startCourse(props: { userId: number; courseId: number }) {
    const lesson = await learnRepository.startCourse(props);
    if (!lesson) throw new ApiError(404, "Lesson not found");
    return { slug: lesson.slug };
  },
  async lessonComplete({
    courseId,
    sectionItemId,
    userId,
  }: {
    userId: number;
    courseId: number;
    sectionItemId: number;
  }) {
    return withTransaction(async tx => {
      const enrollment = await enrollmentRepository.get({ userId, courseId }, tx);
      if (!enrollment) throw new ApiError(404, "Enrollment not found");
      return lessonProgressRepository.lessonComplete({ enrollmentId: enrollment.id, sectionItemId });
    });
  },
  initializeQuizAttempt: async (
    data: {
      userId: number;
      quizId: number;
      snapshotId: number;
      totalPoints: number;
    },
    db: PrismaTransaction,
  ) => {
    const inProgressAttempt = await learnRepository.getInProgressQuizAttempt(
      {
        userId: data.userId,
        quizId: data.quizId,
      },
      db,
    );

    if (inProgressAttempt) {
      await learnRepository.abandonQuizAttempt(
        {
          attemptId: inProgressAttempt.id,
        },
        db,
      );
    }

    const attemptNumber = await learnRepository.getNewAttemptNumber(
      {
        userId: data.userId,
        quizId: data.quizId,
      },
      db,
    );

    return learnRepository.initializeQuizAttempt(
      {
        ...data,
        attemptNumber,
      },
      db,
    );
  },
  startQuiz: async ({ itemId, sectionId, userId }: { sectionId: number; itemId: number; userId: number }) =>
    withTransaction(async tx => {
      const quiz = await quizRepository.getCurrentPublishedVersion({
        itemId,
        sectionId,
      });
      if (!quiz) {
        throw new ApiError(404, "Quiz Not Found");
      }
      const snapshot = (await quizRepository.getOrCreateSnapshot({ ...quiz, quizId: quiz.id })) as StartedQuizSnapshot;
      const totalPoints = snapshot.data.questions.reduce((acc, curr) => curr.points + acc, 0);
      const quizAttemption = await learnService.initializeQuizAttempt(
        { totalPoints, quizId: quiz.id, snapshotId: snapshot.id, userId },
        tx,
      );
      const quizSnapshot = hideCorrectAnswers(snapshot);
      return { ...quizAttemption, quizSnapshot };
    }),

  submitQuiz: async (ids: { attemptId: number; userId: number; itemId: number }, submission: SubmittedAnswers) =>
    withTransaction(async tx => {
      const quizAttempt = await quizRepository.getQuizAttemptById({ ...ids }, tx);
      if (!quizAttempt || !quizAttempt.snapshot) throw new ApiError(404, "Quiz Attemption not found");
      const snapshot = quizAttempt.snapshot as StartedQuizSnapshot;
      const quizAttemptAnswers: quizAttemptAnswersEntity = [];
      let totalEarnedPoints = 0;
      const timeSpentSecond = Math.floor((new Date().getTime() - quizAttempt.startedAt.getTime()) / 1000);
      for (const answer of submission.answers) {
        const question = snapshot.data.questions.find(q => q.id === answer.questionId);

        if (!question) continue;

        const correctOptionIds = question.options
          .filter(o => o.isCorrect)
          .map(o => o.id)
          .sort((a, b) => a - b);

        const selectedOptionIds = [...answer.selectedOptionIds].sort((a, b) => a - b);

        const isCorrect =
          selectedOptionIds.length === correctOptionIds.length &&
          selectedOptionIds.every((id, i) => id === correctOptionIds[i]);

        const earnedPoints = isCorrect ? question.points : 0;
        totalEarnedPoints += earnedPoints;

        quizAttemptAnswers.push({
          attemptId: ids.attemptId,
          snapshotQuestionId: question.id,
          selectedOptionIds,
          correctOptionIds,
          earnedPoints,
        });
      }
      const totalPoints = snapshot.data.questions.reduce((acc, curr) => curr.points + acc, 0);
      const { passed, percentage } = calculateQuizResult({
        passingScorePercent: snapshot.data.passingScorePercent,
        totalEarnedPoints,
        totalPoints,
      });
      const userAnswers = await learnRepository.createManyQuizAttemptAnswer(quizAttemptAnswers, tx);
      const quizResult = await learnRepository.finishedQuizAttempt(ids.attemptId, {
        passed,
        percentage,
        score: totalEarnedPoints,
        totalPoints,
        timeSpentSecond,
      });
      return { ...quizResult, quizSnapshot: hideCorrectAnswers(snapshot), userAnswers };
    }),
};

export default learnService;

function hideCorrectAnswers(snapshot: StartedQuizSnapshot): StartedQuizSnapshotWithoutAnswers {
  return {
    ...snapshot,
    data: {
      ...snapshot.data,
      questions: snapshot.data.questions.map(question => ({
        ...question,
        options: question.options.map(({ isCorrect, ...option }) => option),
      })),
    },
  };
}

function calculateQuizResult({
  passingScorePercent,
  totalEarnedPoints,
  totalPoints,
}: {
  totalPoints: number;
  totalEarnedPoints: number;
  passingScorePercent: number;
}) {
  const percentage = totalPoints === 0 ? 0 : Math.round((totalEarnedPoints / totalPoints) * 100);

  return {
    percentage,
    passed: percentage >= passingScorePercent,
  };
}
