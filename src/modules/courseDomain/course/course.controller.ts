import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate } from "../../../common/utils/validation";
import { courseService } from "./course.service";
import { createCourseSchema } from "./course.validation";

const create: AsyncRequestHandler = async (req, res) => {
  const course = await validate(createCourseSchema, req.body);
  const data = await courseService.create(course, req.user?.id!);
  res.status(200).json({ data });
};

export const list: AsyncRequestHandler = async (req, res) => {
  const page = Number(req.params.page) || 1;
  const limit = Number(req.params.page) || 10;
  const result = await courseService.list(page, limit);
  res.status(200).json(result);
};

export const courseController = {
  create: asyncHandler(create),
  list: asyncHandler(list),
};
