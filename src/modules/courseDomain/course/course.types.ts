import { InferType } from "yup";
import { createCourseSchema, updateCourseSchema, updateCourseTagsSchema } from "./course.validation";

export interface ICourseCreate extends InferType<typeof createCourseSchema> {}

export interface ICourseCreateEntity extends Omit<ICourseCreate, "tags" | "sections" | "discount"> {
  slug: string;
  ownerId: number;
}

export type ICourseSectionsCreate = ICourseCreate["sections"];
export type ICourseDiscountCreate = ICourseCreate["discount"];

export interface ICourseUpdate extends InferType<typeof updateCourseSchema> {}
export interface ICourseUpdateTags extends InferType<typeof updateCourseTagsSchema> {}

export interface ICourseUpdateEntity extends ICourseUpdate {}
