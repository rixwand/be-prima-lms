import { InferType } from "yup";
import { createCourseSchema } from "./course.validation";

export interface ICourseCreate extends InferType<typeof createCourseSchema> {}
