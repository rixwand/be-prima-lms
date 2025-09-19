import { AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { validate } from "../../common/utils/validation";
import { courseSectionService } from "./courseSection.service";
import { createSectionSchema } from "./courseSection.validation";
const create: AsyncRequestHandler = async (req, res) => {
  const courseId = Number(req.params.courseId as string);
  if (!courseId) res.status(400).json("Invalid course-id");
  const { arrayTitle } = await validate(createSectionSchema, req.body);
  const { count } = await courseSectionService.appendSection({ user: req.user!, input: { arrayTitle, courseId } });
  res.status(200).json({ data: { message: `success add ${count} course sections` } });
};

export const courseSectionController = {
  create: asyncHandler(create),
};
