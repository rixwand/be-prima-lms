import { InferType } from "yup";
import { createCourseSchema } from "./course.validation";

export interface ICourseCreate extends InferType<typeof createCourseSchema> {}

export interface ICourseCreateEntity extends Omit<ICourseCreate, "previewVideo" | "descriptionJson" | "tags"> {
  slug: string;
  status?: "DRAFT" | "PUBLISHED";
  ownerId: number;
  previewVideo?: string;
  descriptionJson?: string;
}
