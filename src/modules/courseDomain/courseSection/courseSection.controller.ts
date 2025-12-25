import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate } from "../../../common/utils/validation";
import { courseSectionService } from "./courseSection.service";
import {
  createSectionSchema,
  deleteManyCourseSectionsSchema,
  reorderCourseSectionsSchema,
  updateSectionSchema,
} from "./courseSection.validation";
const list: AsyncRequestHandler = async (req, res) => {
  const { sections, courseTitle } = await courseSectionService.listByCourse(req.course?.id!);
  res.status(200).json({ data: { sections, courseTitle } });
};
const create: AsyncRequestHandler = async (req, res) => {
  const courseId = req.course?.id!;
  const { arrayTitle } = await validate(createSectionSchema, req.body);
  const { count } = await courseSectionService.appendSection(arrayTitle, courseId);
  res.status(200).json({ data: { message: `success add ${count} course sections` } });
};

const update: AsyncRequestHandler = async (req, res) => {
  const { title } = await validate(updateSectionSchema, req.body);
  const data = await courseSectionService.update({
    courseId: req.course?.id!,
    title,
    sectionId: req.section?.id!,
  });
  res.status(200).json({ data });
};

const reorder: AsyncRequestHandler = async (req, res) => {
  const { reorders } = await validate(reorderCourseSectionsSchema, req.body);
  const { newOrder } = await courseSectionService.reorder(req.course?.id!, reorders);
  res.status(200).json({ data: { newOrder } });
};

const remove: AsyncRequestHandler = async (req, res) => {
  const { id, title } = await courseSectionService.remove(req.section!);
  res.status(200).json({ data: { removedId: id, message: `success remove course section "${title}"` } });
};

const removeMany: AsyncRequestHandler = async (req, res) => {
  const ids = new Set((await validate(deleteManyCourseSectionsSchema, req.body)).ids);
  const { count } = await courseSectionService.removeMany({ ids: Array.from(ids), courseId: req.course?.id! });
  res.status(200).json({ data: { message: `success remove ${count} course sections` } });
};

export const courseSectionController = {
  list: asyncHandler(list),
  create: asyncHandler(create),
  update: asyncHandler(update),
  reorder: asyncHandler(reorder),
  remove: asyncHandler(remove),
  removeMany: asyncHandler(removeMany),
};
