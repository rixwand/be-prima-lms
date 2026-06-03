import { InputJsonValue } from "@prisma/client/runtime/library";
import { InferType } from "yup";
import { publishContentShema } from "./lesson.validation";

export interface ILessonPublishContent extends InferType<typeof publishContentShema> {}

export type LessonUpdateInput = {
  summary?: string;
  contentDraft?: InputJsonValue;
  contentLive?: InputJsonValue;
};
