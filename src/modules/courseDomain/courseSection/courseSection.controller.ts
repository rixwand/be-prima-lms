import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate } from "../../../common/utils/validation";
import { courseSectionService } from "./courseSection.service";
import { createSectionSchema, reorderCourseSectionsSchema, updateSectionSchema } from "./courseSection.validation";
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
  console.log("reorders input: ", req.body);
  const { reorders } = await validate(reorderCourseSectionsSchema, req.body);
  const { newOrder } = await courseSectionService.reorder(req.course?.id!, reorders);
  res.status(200).json({ data: newOrder });
};

export const courseSectionController = {
  create: asyncHandler(create),
  update: asyncHandler(update),
  reorder: asyncHandler(reorder),
};
