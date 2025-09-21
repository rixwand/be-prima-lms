import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams } from "../../../common/utils/validation";
import { courseSectionService } from "./courseSection.service";
import { createSectionSchema } from "./courseSection.validation";
const create: AsyncRequestHandler = async (req, res) => {
  const courseId = await validateIdParams(Number(req.params.courseId as string));
  const { arrayTitle } = await validate(createSectionSchema, req.body);
  const { count } = await courseSectionService.appendSection(arrayTitle, courseId);
  res.status(200).json({ data: { message: `success add ${count} course sections` } });
};

export const courseSectionController = {
  create: asyncHandler(create),
};
