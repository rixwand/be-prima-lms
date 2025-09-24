import { InferType } from "yup";
import { createCourseSchema, updateCourseSchema, updateCourseTagsSchema } from "./course.validation";

export interface ICourseCreate extends InferType<typeof createCourseSchema> {}

export interface ICourseCreateEntity extends Omit<ICourseCreate, "tags"> {
  slug: string;
  ownerId: number;
}

export interface ICourseUpdate extends InferType<typeof updateCourseSchema> {}
export interface ICourseUpdateTags extends InferType<typeof updateCourseTagsSchema> {}

export interface ICourseUpdateEntity extends ICourseUpdate {}
