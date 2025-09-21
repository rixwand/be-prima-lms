import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams } from "../../../common/utils/validation";
import { lessonService } from "./lesson.service";
import { createLessonSchema } from "./lesson.validation";

const create: AsyncRequestHandler = async (req, res) => {
  const sectionId = await validateIdParams(Number(req.params.sectionId as string));
  const lessons = await validate(createLessonSchema, req.body);
  const { count } = await lessonService.create(lessons, sectionId);
  res.status(200).json({ data: { message: `success add ${count} lesson${count > 1 ? "s" : ""}` } });
};

export const lessonController = {
  create: asyncHandler(create),
};
