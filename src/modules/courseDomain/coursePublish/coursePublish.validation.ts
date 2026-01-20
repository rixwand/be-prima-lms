import { PublishRequestStatus } from "@prisma/client";
import * as yup from "yup";

export const createCoursePublishRequestSchema = yup
  .object({
    notes: yup.string().optional(),
  })
  .noUnknown();

export const notesCoursePublishRequestSchema = yup
  .object({
    notes: yup.string().max(500).optional(),
  })
  .noUnknown();

export const listCoursePublishRequestQueriesSchema = yup
  .object({
    status: yup.mixed<PublishRequestStatus>().oneOf(Object.values(PublishRequestStatus)).optional(),
    page: yup.number().integer().positive().optional(),
    limit: yup.number().integer().positive().optional(),
    startDate: yup.date().optional(),
    endDate: yup.date().optional(),
    search: yup.string().optional(),
  })
  .noUnknown();
