import { InputJsonObject } from "@prisma/client/runtime/library";
import { InferType } from "yup";
import { createQuizQuestionSchema, updateQuizQuestionSchema, updateQuizSchema } from "./quiz.validation";

export interface IUpdateQuizSchema extends InferType<typeof updateQuizSchema> {}

export interface ICreateQestionSchema extends InferType<typeof createQuizQuestionSchema> {}
export interface IUpdateQestionSchema extends InferType<typeof updateQuizQuestionSchema> {}

export interface IQuizPublishedSnapshot extends InputJsonObject {
  description: string;
  questions: {
    question: string;
    position: number;
    multipleAnswer: boolean;
    estimatedTimesSecond: number;
    points: number;
    options: {
      value: string;
      isCorrect: boolean;
      position: number;
    }[];
  }[];
}
