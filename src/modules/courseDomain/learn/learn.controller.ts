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

export default {
  getCurriculum: asyncHandler(getCurriculum),
  getLessonContent: asyncHandler(getLessonContent),
};
