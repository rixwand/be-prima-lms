import { ApiError, AsyncRequestHandler, asyncHandler } from "../../../../common/utils/http";
import { validate, validateIdParams } from "../../../../common/utils/validation";
import quizService from "./quiz.service";
import { deleteManyQuestionsSchema, updateQuizSchema } from "./quiz.validation";

const update: AsyncRequestHandler = async (req, res) => {
  const quiz = await validate(updateQuizSchema, req.body);
  await quizService.update(quiz, req.sectionItem?.id!);
  res.status(200).json({ data: "ok" });
};

const get: AsyncRequestHandler = async (req, res) => {
  const quiz = await quizService.get(req.sectionItem?.id!);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  res.status(200).json({ data: quiz });
};

const publish: AsyncRequestHandler = async (req, res) => {
  const updateQuiz = req.body ? await validate(updateQuizSchema, req.body) : undefined;
  const message = await quizService.publish(req.sectionItem?.id!, updateQuiz);

  res.status(200).json({ data: { message } });
};

const deleteQuestion: AsyncRequestHandler = async (req, res) => {
  const { id: questionId } = await validateIdParams(req.params.questionId);
  const data = await quizService.deleteQuestions(questionId, req.sectionItem?.id!);
  res.status(200).json({ data: { message: `Success delete question "${data.question}"` } });
};

const deleteManyQuestions: AsyncRequestHandler = async (req, res) => {
  const { ids } = await validate(deleteManyQuestionsSchema, req.body);
  const data = await quizService.deleteQuestions(ids, req.sectionItem?.id!);
  res.status(200).json({ data: { message: `Success delete ${data.count} question` } });
};

export default {
  update: asyncHandler(update),
  get: asyncHandler(get),
  publish: asyncHandler(publish),
  deleteQuestion: asyncHandler(deleteQuestion),
  deleteManyQuestions: asyncHandler(deleteManyQuestions),
};
