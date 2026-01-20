import { InferType } from "yup";
import {
  createCourseSchema,
  listMyCoursesParamsSchema,
  listPublicCoursesParamsSchema,
  listPublicTagsParamsSchema,
  updateCourseSchema,
  updateCourseTagsSchema,
} from "./course.validation";

export const COURSE_STATUS = ["PENDING", "DRAFT", "PUBLISHED", "ARCHIVED", "REJECTED"] as const;
export type CourseStatus = (typeof COURSE_STATUS)[number];

export interface ICourseCreate extends InferType<typeof createCourseSchema> {}

export interface ICourseCreateEntity extends Omit<ICourseCreate, "tags" | "sections" | "discount" | "categories"> {
  slug: string;
  ownerId: number;
}

export type ICourseCategoriesCreateEntity = ICourseCreate["categories"];

export type ICourseSectionsCreate = ICourseCreate["sections"];
export type ICourseDiscountCreate = ICourseCreate["discount"];

export interface ICourseUpdate extends InferType<typeof updateCourseSchema> {}
export interface ICourseUpdateTags extends InferType<typeof updateCourseTagsSchema> {}

export interface ICourseUpdateEntity extends ICourseUpdate {}

export interface IListMyCourseParams extends InferType<typeof listMyCoursesParamsSchema> {}

export interface IListPublicCourseParams extends InferType<typeof listPublicCoursesParamsSchema> {
  primaryCategory?: string | undefined;
}

export interface IListPublicTagsParams extends InferType<typeof listPublicTagsParamsSchema> {}
