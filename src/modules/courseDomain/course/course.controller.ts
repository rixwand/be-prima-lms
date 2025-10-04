import { ApiError, AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate } from "../../../common/utils/validation";
import { courseService } from "./course.service";
import {
  createCourseSchema,
  deleteManyCourseSchema,
  updateCourseSchema,
  updateCourseTagsSchema,
} from "./course.validation";

const create: AsyncRequestHandler = async (req, res) => {
  const course = await validate(createCourseSchema, req.body);
  const data = await courseService.create(course, req.user?.id!);
  res.status(200).json({ data });
};

const list: AsyncRequestHandler = async (req, res) => {
  const page = Number(req.params.page) || 1;
  const limit = Number(req.params.page) || 10;
  const result = await courseService.list(page, limit);
  res.status(200).json({ data: result });
};

const update: AsyncRequestHandler = async (req, res) => {
  const course = await validate(updateCourseSchema, req.body);
  const data = await courseService.update(course, req.course?.id!);
  res.status(200).json({ data });
};

const updateTags: AsyncRequestHandler = async (req, res) => {
  const tagObj = await validate(updateCourseTagsSchema, req.body);
  const data = await courseService.updateTags(tagObj, req.course?.id!);
  res.status(200).json({ data });
};

const remove: AsyncRequestHandler = async (req, res) => {
  const { id, title } = await courseService.remove(req.course?.id!);
  res.status(200).json({ data: { removedId: id, message: `success remove course "${title}"` } });
};

const removeMany: AsyncRequestHandler = async (req, res) => {
  const ids = new Set((await validate(deleteManyCourseSchema, req.body)).ids);
  const { count } = await courseService.removeMany(Array.from(ids));
  res.status(200).json({ data: { message: `success remove ${count} course` } });
};

const myCourse: AsyncRequestHandler = async (req, res) => {
  const page = Number(req.params.page) || 1;
  const limit = Number(req.params.page) || 10;
  const result = await courseService.myCourse({
    userId: req.user?.id!,
    limit,
    page,
  });
  res.status(200).json({ data: result });
};

const preview: AsyncRequestHandler = async (req, res) => {
  const slug = req.params.courseSlug;
  if (!slug) throw new ApiError(400, "Invalid slug");
  const course = await courseService.getPreview(slug);
  res.status(200).json({ data: course });
};

export const courseController = {
  create: asyncHandler(create),
  list: asyncHandler(list),
  update: asyncHandler(update),
  updateTags: asyncHandler(updateTags),
  remove: asyncHandler(remove),
  removeMany: asyncHandler(removeMany),
  myCourse: asyncHandler(myCourse),
  preview: asyncHandler(preview),
};
