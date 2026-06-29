import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams } from "../../../common/utils/validation";
import learnService from "./learn.service";
import { submitQuizSchema, validateSectionItemTypeParams } from "./learn.validation";

const getCurriculum: AsyncRequestHandler = async (req, res) => {
  const curriculum = await learnService.getCurriculum(req.course?.id!);
  res.status(200).json({ data: curriculum });
};

const getItemContent: AsyncRequestHandler = async (req, res) => {
  const [{ id: sectionId }, { id: itemId }] = await Promise.all([
    validateIdParams(req.params.sectionId),
    validateIdParams(req.params.itemId),
  ]);
  const { type } = await validateSectionItemTypeParams(req.params.itemType);
  const lessonContent = await learnService.getItemContent({ courseId: req.course?.id!, sectionId, itemId }, type);
  res.status(200).json({ data: lessonContent });
};
const startCourse: AsyncRequestHandler = async (req, res) => {
  const data = await learnService.startCourse({ courseId: req.course?.id!, userId: req.user?.id! });
  res.status(200).json({ data });
};
const lessonComplete: AsyncRequestHandler = async (req, res) => {
  const { id: sectionItemId } = await validateIdParams(req.params.sectionItemId);
  const { sectionItemId: lId, status } = await learnService.lessonComplete({
    courseId: req.course?.id!,
    sectionItemId,
    userId: req.user?.id!,
  });
  res.status(200).json({ data: { sectionItemId: lId, status } });
};

const startQuiz: AsyncRequestHandler = async (req, res) => {
  const [{ id: sectionId }, { id: itemId }] = await Promise.all([
    validateIdParams(req.params.sectionId),
    validateIdParams(req.params.itemId),
  ]);
  const quizAttempt = await learnService.startQuiz({ itemId, sectionId, userId: req.user?.id! });
  res.status(200).json({ data: quizAttempt });
};

const submitQuiz: AsyncRequestHandler = async (req, res) => {
  const [{ id: itemId }, { id: attemptId }] = await Promise.all([
    validateIdParams(req.params.itemId),
    validateIdParams(req.params.attemptId),
  ]);
  const SubmittedAnswers = await validate(submitQuizSchema, req.body);
  const result = await learnService.submitQuiz({ attemptId, itemId, userId: req.user?.id! }, SubmittedAnswers);
  res.status(200).json({ data: result });
};

export default {
  getCurriculum: asyncHandler(getCurriculum),
  getItemContent: asyncHandler(getItemContent),
  startCourse: asyncHandler(startCourse),
  lessonComplete: asyncHandler(lessonComplete),
  startQuiz: asyncHandler(startQuiz),
  submitQuiz: asyncHandler(submitQuiz),
};
