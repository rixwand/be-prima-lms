import * as yup from "yup";

export const createQuizOptionSchema = yup.object({
  value: yup.string().required(),
  isCorrect: yup.boolean().optional().default(false),
});

export const createQuizQuestionSchema = yup.object({
  position: yup.number().positive().integer().min(1).required(),
  question: yup.string().required().min(10),
  options: yup.array().of(createQuizOptionSchema).min(2).max(5).required(),
  estimatedTimesSecond: yup.number().positive().integer().min(60).required(),
  points: yup.number().positive().integer().min(5).required(),
  multipleAnswer: yup.boolean().optional(),
});

export const updateQuizQuestionSchema = yup.object({
  id: yup.number().positive().integer().required(),
  position: yup.number().positive().integer().min(1).optional(),
  question: yup.string().min(10).optional(),
  options: yup.array().of(createQuizOptionSchema).min(2).max(5).optional(),
  estimatedTimesSecond: yup.number().positive().integer().min(60).optional(),
  points: yup.number().positive().integer().min(5).optional(),
  multipleAnswer: yup.boolean().optional(),
});

export const quizQuestionSchema = yup.lazy(value => {
  if (value?.id) {
    return updateQuizQuestionSchema;
  }

  return createQuizQuestionSchema;
});

export const updateQuizSchema = yup
  .object({
    description: yup.string().optional(),
    questions: yup.array().of(quizQuestionSchema).optional(),
    topics: yup.array().of(yup.string().trim().required()).min(1).optional(),
    passingScorePercent: yup.number().integer().min(50).max(100).optional(),
  })
  .noUnknown()
  .required();

export const deleteManyQuestionsSchema = yup
  .object({
    ids: yup
      .array()
      .of(yup.number().integer().positive().required())
      .min(1, "At least one id must be provided")
      .required("ids field is required"),
  })
  .noUnknown()
  .required();
