import { InferType } from "yup";
import {
  createCoursePublishRequestSchema,
  listCoursePublishRequestQueriesSchema,
  updateCoursePublishRequestSchema,
} from "./coursePublish.validation";

export interface ICreateCoursePublishRequest extends InferType<typeof createCoursePublishRequestSchema> {}

export interface IUpdateCoursePublishRequest extends InferType<typeof updateCoursePublishRequestSchema> {}

export interface GetCoursePublishRequestQueries extends InferType<typeof listCoursePublishRequestQueriesSchema> {}
