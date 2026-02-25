import { ApiError, AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams, validateSlugParams } from "../../../common/utils/validation";
import courseDraftService from "../courseDraft/courseDraft.service";
import { courseService } from "./course.service";
import {
  createCourseSchema,
  deleteManyCourseSchema,
  listMyCoursesParamsSchema,
  listPublicCoursesParamsSchema,
  listPublicTagsParamsSchema,
  updateCourseCategoriesSchema,
  updateCourseSchema,
  updateCourseTagsSchema,
} from "./course.validation";

const create: AsyncRequestHandler = async (req, res) => {
  const course = await validate(createCourseSchema, req.body);
  const data = await courseDraftService.create(course, req.user?.id!);
  res.status(200).json({ data });
};

const listPublicCourses: AsyncRequestHandler = async (req, res) => {
  const { slug: primaryCategory } = await validateSlugParams(req.params.primaryCategory, { optional: true });
  const params = await validate(listPublicCoursesParamsSchema, req.query);
  const result = await courseService.listPublicCourses({ ...params, primaryCategory });
  res.status(200).json({ data: result });
};

const listPublicTags: AsyncRequestHandler = async (req, res) => {
  const params = await validate(listPublicTagsParamsSchema, req.query);
  const data = await courseService.listPublicTags(params);
  res.status(200).json({ data });
};

const update: AsyncRequestHandler = async (req, res) => {
  const course = await validate(updateCourseSchema, req.body);
  const data = await courseDraftService.updateDraft({
    course,
    courseId: req.course?.id!,
    draftId: req.course?.draftId!,
  });
  res.status(200).json({ data });
};

const updateTags: AsyncRequestHandler = async (req, res) => {
  const tagObj = await validate(updateCourseTagsSchema, req.body);
  const data = await courseDraftService.updateDraftTags({
    tagObj,
    draftId: req.course?.draftId!,
    courseId: req.course?.id!,
  });
  res.status(200).json({ data });
};

const remove: AsyncRequestHandler = async (req, res) => {
  const { id, metaDraft } = await courseService.remove(req.course?.id!);
  res.status(200).json({ data: { removedId: id, message: `success remove course "${metaDraft?.title}"` } });
};

const removeMany: AsyncRequestHandler = async (req, res) => {
  const ids = new Set((await validate(deleteManyCourseSchema, req.body)).ids);
  const { count } = await courseService.removeMany(Array.from(ids));
  res.status(200).json({ data: { message: `success remove ${count} course` } });
};

const myCourses: AsyncRequestHandler = async (req, res) => {
  const params = await validate(listMyCoursesParamsSchema, req.query);
  console.log("get course params", params);
  const result = await courseService.myCourses({
    userId: req.user?.id!,
    params,
  });
  res.status(200).json({ data: result });
};

const preview: AsyncRequestHandler = async (req, res) => {
  const slug = (await validateSlugParams(req.params.courseSlug)).slug;
  if (!slug) throw new ApiError(400, "Invalid slug");
  const course = await courseService.getPreview(slug);
  res.status(200).json({ data: course });
};

const get: AsyncRequestHandler = async (req, res) => {
  const course = await courseService.get(req.course?.id!);
  res.status(200).json({ data: course });
};

const removeDiscount: AsyncRequestHandler = async (req, res) => {
  const draftId = req.course?.draftId!;
  const { id } = await validateIdParams(req.params.discountId);
  await courseDraftService.removeDiscount({ draftId, id });
  res.status(200).json({ data: { message: "Successfully remove discount" } });
};

const applyMetaDraft: AsyncRequestHandler = async (req, res) => {
  await courseService.applyMetaDraft(req.course?.id!);
  res.status(200).json({ data: { message: "Publish draft changes success" } });
};

const updateCategories: AsyncRequestHandler = async (req, res) => {
  const { newCategories } = await validate(updateCourseCategoriesSchema, req.body);
  const { created, removed } = await courseDraftService.updateCategories({
    categories: newCategories,
    courseId: req.course?.id!,
    draftId: req.course?.draftId!,
  });
  res.status(200).json({ data: { message: `add ${created} category and remove ${removed} category` } });
};

export const courseController = {
  create: asyncHandler(create),
  listPublicCourses: asyncHandler(listPublicCourses),
  update: asyncHandler(update),
  updateTags: asyncHandler(updateTags),
  remove: asyncHandler(remove),
  removeMany: asyncHandler(removeMany),
  myCourses: asyncHandler(myCourses),
  preview: asyncHandler(preview),
  get: asyncHandler(get),
  removeDiscount: asyncHandler(removeDiscount),
  listPublicTags: asyncHandler(listPublicTags),
  applyMetaDraft: asyncHandler(applyMetaDraft),
  updateCategories: asyncHandler(updateCategories),
};
