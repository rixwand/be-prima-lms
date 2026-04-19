import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams } from "../../../common/utils/validation";
import { NOTIFICATION } from "../../../config";
import dispatcher from "../../../core/events/dispatcher";
import { DOMAIN_EVENTS } from "../../../core/events/events";
import { coursePublishService } from "./coursePublish.service";
import {
  createCoursePublishRequestSchema,
  listCoursePublishRequestQueriesSchema,
  notesCoursePublishRequestSchema,
} from "./coursePublish.validation";

const createRequest: AsyncRequestHandler = async (req, res) => {
  const { notes } = await validate(createCoursePublishRequestSchema, req.body);
  const data = await coursePublishService.createRequest({ notes }, req.course?.id!);
  dispatcher.emit(DOMAIN_EVENTS.NEW_ADMIN_NOTIFICATIONS, {
    type: NOTIFICATION.TYPES.COURSE_SUBMISSION,
    message: "New Course Publish Request",
    courseId: req.course?.id!,
    ...(typeof req.user?.id === "number" ? { requestedByUserId: req.user.id } : {}),
  });
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
  dispatcher.emit(DOMAIN_EVENTS.NEW_USER_NOTIFICATIONS, {
    type: "course_approved",
    toUserId: published.ownerId,
    message: "Course Publish Request Approved",
  });
  res.status(200).json({ data: { message: `course "${published.courseTitle}" has been published` } });
};

const rejectRequest: AsyncRequestHandler = async (req, res) => {
  const { id: reqId } = await validateIdParams(req.params.requestId);
  const { notes } = await validate(notesCoursePublishRequestSchema, req.body);
  const published = await coursePublishService.rejectRequest({ reqId, userId: req.user?.id!, ...(notes && { notes }) });
  dispatcher.emit(DOMAIN_EVENTS.NEW_USER_NOTIFICATIONS, {
    type: "course_rejected",
    toUserId: published.ownerId,
    message: "Course Publish Request Rejected",
  });
  res.status(200).json({ data: { message: `course "${published.courseTitle}" has been rejected` } });
};

const cancelRequest: AsyncRequestHandler = async (req, res) => {
  const canceled = await coursePublishService.cancelRequest(req.course?.id!);
  dispatcher.emit(DOMAIN_EVENTS.NEW_ADMIN_NOTIFICATIONS, {
    type: NOTIFICATION.TYPES.COURSE_SUBMISSION_CANCELED,
    message: "Course Publish Request Canceled",
    courseId: req.course?.id!,
    ...(typeof req.user?.id === "number" ? { canceledByUserId: req.user.id } : {}),
  });
  res.status(200).json({ data: { message: `Publish request for course ${canceled.title} is canceled` } });
};

// const unPublish: AsyncRequestHandler = async (req, res) => {
//   const takenDown = await coursePublishService.unPublish(req.course?.id!);
//   res.status(200).json({ data: { message: `course "${takenDown.title}" has been taken down` } });
// };

export const coursePublishController = {
  createRequest: asyncHandler(createRequest),
  listRequest: asyncHandler(listRequest),
  approveRequest: asyncHandler(approveRequest),
  rejectRequest: asyncHandler(rejectRequest),
  cancelRequest: asyncHandler(cancelRequest),
  // unPublish: asyncHandler(unPublish),
};
