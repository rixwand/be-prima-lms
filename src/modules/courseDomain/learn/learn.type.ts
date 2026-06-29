import { InferType } from "yup";
import { submitQuizSchema } from "./learn.validation";

export type PublishedQuizData = {
  id: number;
  passingScorePercent: number;
  description: string;
  questions: PublishedQuizQuestion[];
  topics: string[];
};
export type PublishedQuizQuestion = {
  id: number;
  points: number;
  position: number;
  question: string;
  multipleAnswer: boolean;
  estimatedTimesSecond: number;
  options: PublishedQuizOption[];
};

export type PublishedQuizOption = {
  id: number;
  value: string;
  position: number;
  isCorrect: boolean;
};

export type StartedQuizSnapshot = {
  id: number;
  quizId: number;
  publishedVersion: number;
  createdAt: Date;
  data: PublishedQuizData;
};

export type StartedQuizSnapshotWithoutAnswers = Omit<StartedQuizSnapshot, "data"> & {
  data: Omit<PublishedQuizData, "questions"> & {
    questions: (Omit<PublishedQuizQuestion, "options"> & {
      options: Omit<PublishedQuizOption, "isCorrect">[];
    })[];
  };
};

export interface SubmittedAnswers extends InferType<typeof submitQuizSchema> {}
export type quizAttemptAnswersEntity = {
  attemptId: number;
  snapshotQuestionId: number;
  selectedOptionIds: number[];
  correctOptionIds: number[];
  earnedPoints: number;
}[];
