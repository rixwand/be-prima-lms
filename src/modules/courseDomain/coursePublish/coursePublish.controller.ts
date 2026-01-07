import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams } from "../../../common/utils/validation";
import { coursePublishService } from "./coursePublish.service";
import {
  createCoursePublishRequestSchema,
  listCoursePublishRequestQueriesSchema,
  notesCoursePublishRequestSchema,
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

const approveRequest: AsyncRequestHandler = async (req, res) => {
  const { id: reqId } = await validateIdParams(req.params.requestId);
  const published = await coursePublishService.approveRequest({ reqId, userId: req.user?.id! });
  res.status(200).json({ data: `course "${published.courseTitle}" has been published` });
};

const rejectRequest: AsyncRequestHandler = async (req, res) => {
  const { id: reqId } = await validateIdParams(req.params.requestId);
  const { notes } = await validate(notesCoursePublishRequestSchema, req.body);
  const published = await coursePublishService.rejectRequest({ reqId, userId: req.user?.id!, ...(notes && { notes }) });
  res.status(200).json({ data: `course "${published.courseTitle}" has been rejected` });
};

export const coursePublishController = {
  createRequest: asyncHandler(createRequest),
  listRequest: asyncHandler(listRequest),
  approveRequest: asyncHandler(approveRequest),
  rejectRequest: asyncHandler(rejectRequest),
};
