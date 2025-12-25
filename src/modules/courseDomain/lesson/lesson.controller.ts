import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams } from "../../../common/utils/validation";
import { LessonReorderItem, lessonService } from "./lesson.service";
import {
  createLessonSchema,
  deleteManyLessonsSchema,
  reorderLessonsSchema,
  updateLessonSchema,
} from "./lesson.validation";

const create: AsyncRequestHandler = async (req, res) => {
  const { id: sectionId } = await validateIdParams(req.params.sectionId);
  const lessons = await validate(createLessonSchema, req.body);
  const { count } = await lessonService.create(lessons, sectionId);
  res.status(200).json({ data: { message: `success add ${count} lesson${count > 1 ? "s" : ""}` } });
};

const update: AsyncRequestHandler = async (req, res) => {
  const lesson = await validate(updateLessonSchema, req.body);
  const data = await lessonService.update(lesson, { ...req.lesson! });
  res.status(200).json({ data });
};

const remove: AsyncRequestHandler = async (req, res) => {
  const { id, title } = await lessonService.remove(req.lesson!);
  res.status(200).json({ data: { removedId: id, message: `success remove course section "${title}"` } });
};

const removeMany: AsyncRequestHandler = async (req, res) => {
  const ids = new Set((await validate(deleteManyLessonsSchema, req.body)).ids);
  const { count } = await lessonService.removeMany({ ids: Array.from(ids), sectionId: req.section?.id! });
  res.status(200).json({ data: { message: `success remove ${count} course sections` } });
};

const list: AsyncRequestHandler = async (req, res) => {
  const { id: sectionId } = await validateIdParams(req.params.sectionId);
  const lessons = await lessonService.list(sectionId);
  res.status(200).json({ data: lessons });
};

const reorder: AsyncRequestHandler = async (req, res) => {
  console.log("reorder req body: ", req.body);
  const { reorders } = await validate(reorderLessonsSchema, req.body);
  console.log("reorder request: ", reorders);
  const { newOrder } = await lessonService.reorderLessons(req.section?.id!, reorders as LessonReorderItem[]);
  console.log("new Order: ", newOrder);
  res.status(200).json({ data: { newOrder } });
};

export const lessonController = {
  create: asyncHandler(create),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
  removeMany: asyncHandler(removeMany),
  list: asyncHandler(list),
  reorder: asyncHandler(reorder),
};
