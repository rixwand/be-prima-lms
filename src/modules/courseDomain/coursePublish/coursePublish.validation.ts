import { PublishRequestStatus } from "@prisma/client";
import * as yup from "yup";

export const createCoursePublishRequestSchema = yup.object({
  notes: yup.string().optional(),
});

export const updateCoursePublishRequestSchema = yup.object({
  status: yup.mixed<"APPROVED" | "REJECTED">().oneOf(["APPROVED", "REJECTED"]).required(),
  notes: yup.string().optional(),
  reviewedById: yup.number().integer().positive().optional(),
});

export const getCoursePublishRequestQueriesSchema = yup.object({
  status: yup.mixed<PublishRequestStatus>().oneOf(Object.values(PublishRequestStatus)).optional(),
  page: yup.number().integer().positive().optional(),
  limit: yup.number().integer().positive().optional(),
  startDate: yup.date().optional(),
  endDate: yup.date().optional(),
  search: yup.string().optional(),
});
