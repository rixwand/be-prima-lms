import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams } from "../../../common/utils/validation";
import { coursePublishService } from "./coursePublish.service";
import {
  createCoursePublishRequestSchema,
  listCoursePublishRequestQueriesSchema,
  updateCoursePublishRequestSchema,
} from "./coursePublish.validation";

const createRequest: AsyncRequestHandler = async (req, res) => {
  const { notes } = await validate(createCoursePublishRequestSchema, req.body);
  const data = await coursePublishService.createRequest({ notes }, req.course?.id!);
  res.status(201).json({ data });
};

const listRequest: AsyncRequestHandler = async (req, res) => {
  const queryParams = await validate(listCoursePublishRequestQueriesSchema, req.query);
  const result = await coursePublishService.listRequest(queryParams);

  res.status(200).json({ data: result });
};

const updateRequest: AsyncRequestHandler = async (req, res) => {
  const { id } = await validateIdParams(req.params.requestId);
  const { status, notes } = await validate(updateCoursePublishRequestSchema, req.body);
  const reviewedById = req.user?.id!; // Assuming req.user exists and has the reviewer's ID
  const data = await coursePublishService.updateRequest(id, { status, notes }, reviewedById);
  res.status(200).json({ data });
};

const deleteRequest: AsyncRequestHandler = async (req, res) => {
  const { id: courseId } = await validateIdParams(req.params.courseId);
  await coursePublishService.deleteRequest(courseId);
  res.status(204).send();
};

export const coursePublishController = {
  createRequest: asyncHandler(createRequest),
  listRequest: asyncHandler(listRequest),
  updateRequest: asyncHandler(updateRequest),
  deleteRequest: asyncHandler(deleteRequest),
};
