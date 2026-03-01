import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validateIdParams } from "../../../common/utils/validation";
import learnService from "./learn.service";

const getCurriculum: AsyncRequestHandler = async (req, res) => {
  const curriculum = await learnService.getCurriculum(req.course?.id!);
  console.log(curriculum);
  res.status(200).json({ data: curriculum });
};

const getLessonContent: AsyncRequestHandler = async (req, res) => {
  const [{ id: sectionId }, { id: lessonId }] = await Promise.all([
    validateIdParams(req.params.sectionId),
    validateIdParams(req.params.lessonId),
  ]);
  const lessonContent = await learnService.getLessonContent({ courseId: req.course?.id!, sectionId, lessonId });
  res.status(200).json({ data: lessonContent });
};

const startCourse: AsyncRequestHandler = async (req, res) => {
  const data = await learnService.startCourse({ courseId: req.course?.id!, userId: req.user?.id! });
  res.status(200).json({ data });
};
const lessonComplete: AsyncRequestHandler = async (req, res) => {
  const { id: lessonId } = await validateIdParams(req.params.lessonId);
  const { lessonId: lId, status } = await learnService.lessonComplete({
    courseId: req.course?.id!,
    lessonId,
    userId: req.user?.id!,
  });
  res.status(200).json({ data: { lessonId: lId, status } });
};

export default {
  getCurriculum: asyncHandler(getCurriculum),
  getLessonContent: asyncHandler(getLessonContent),
  startCourse: asyncHandler(startCourse),
  lessonComplete: asyncHandler(lessonComplete),
};
