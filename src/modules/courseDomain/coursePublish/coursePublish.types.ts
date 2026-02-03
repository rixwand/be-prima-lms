import { $Enums } from "@prisma/client";
import { InferType } from "yup";
import { createCoursePublishRequestSchema, listCoursePublishRequestQueriesSchema } from "./coursePublish.validation";

export interface ICreateCoursePublishRequest extends InferType<typeof createCoursePublishRequestSchema> {
  type: $Enums.CoursePublishType;
}

export interface IUpdateStatusCoursePublishRequest {
  notes: string;
  status: "APPROVED" | "REJECTED" | "PENDING";
  reviewedById?: number;
  type?: $Enums.CoursePublishType;
}

export interface GetCoursePublishRequestQueries extends InferType<typeof listCoursePublishRequestQueriesSchema> {}
