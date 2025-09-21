import { InferType } from "yup";
import { createLessonSchema } from "./lesson.validation";

export interface ILessonsCreate extends InferType<typeof createLessonSchema> {}

export interface ILessonCreateEntity extends Omit<ILessonsCreate[number], "durationSec" | "summary"> {
  durationSec?: number;
  summary?: string;
  sectionId: number;
  position: number;
  slug: string;
}
