import { AsyncRequestHandler, asyncHandler } from "../../../../common/utils/http";
import { validate } from "../../../../common/utils/validation";
import { lessonService } from "./lesson.service";
import { publishContentShema, updateLessonSchema } from "./lesson.validation";

const update: AsyncRequestHandler = async (req, res) => {
  const lesson = await validate(updateLessonSchema, req.body);
  const data = await lessonService.update(lesson, req.sectionItem?.id!);
  res.status(200).json({ data });
};

const getContent: AsyncRequestHandler = async (req, res) => {
  const data = await lessonService.getContent(req.sectionItem?.id!);
  res.status(200).json({ data });
};

const publishContent: AsyncRequestHandler = async (req, res) => {
  const { newDraft } = await validate(publishContentShema, req.body);
  const message = await lessonService.publishContent({
    sectionItemId: req.sectionItem?.id!,
    newDraft,
  });
  res.status(200).json({ data: { message } });
};

export const lessonController = {
  update: asyncHandler(update),
  getContent: asyncHandler(getContent),
  publishContent: asyncHandler(publishContent),
};
