import { InferType } from "yup";
import { createCoursePublishRequestSchema, listCoursePublishRequestQueriesSchema } from "./coursePublish.validation";

export interface ICreateCoursePublishRequest extends InferType<typeof createCoursePublishRequestSchema> {}

export interface IUpdateStatusCoursePublishRequest {
  notes: string;
  status: "APPROVED" | "REJECTED" | "PENDING";
  reviewedById?: number;
}

export interface GetCoursePublishRequestQueries extends InferType<typeof listCoursePublishRequestQueriesSchema> {}
