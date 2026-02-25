import { InferType } from "yup";
import {
  createLessonSchema,
  lessonSchema,
  publishContentShema,
  reorderLessonsSchema,
  updateLessonSchema,
} from "./lesson.validation";

export interface ILessonsCreate extends InferType<typeof createLessonSchema> {}

export interface ILessonCreateEntity extends Omit<ILessonsCreate[number], "durationSec" | "summary"> {
  durationSec?: number;
  summary?: string;
  sectionId: number;
  position: number;
  slug: string;
}
export interface ILessonReorderPayload extends InferType<typeof reorderLessonsSchema> {}
export interface ILessonPayload extends InferType<typeof lessonSchema> {}
export interface ILessonPublishContent extends InferType<typeof publishContentShema> {}
export interface ILessonUpdate extends InferType<typeof updateLessonSchema> {}
