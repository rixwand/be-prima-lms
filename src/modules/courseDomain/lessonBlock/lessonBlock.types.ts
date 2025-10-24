import { InferType } from "yup";
import { createLessonBlockSchema, updateLessonBlockSchema } from "./lessonBlock.validation";

export type ILessonBlockCreate = InferType<typeof createLessonBlockSchema>;

export type ILessonBlockUpdate = InferType<typeof updateLessonBlockSchema>;
