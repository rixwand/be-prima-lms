import { InferType } from "yup";
import {
  deleteManySectionItemsSchema,
  publishSectionItemContentSchema,
  reorderSectionItemsSchema,
  sectionItemIdParamSchema,
  sectionItemSchema,
  updateSectionItemLessonSchema,
} from "./sectionItem.validation";

export interface ISectionItemIdParam extends InferType<typeof sectionItemIdParamSchema> {}
export interface ISectionItemPayload extends InferType<typeof sectionItemSchema> {}
export type ISectionItemLessonsCreate = ISectionItemPayload[];
export interface ISectionItemLessonCreateEntity extends Omit<ISectionItemPayload, "durationSec" | "summary"> {
  durationSec?: number;
  summary?: string;
  sectionId: number;
  position: number;
  slug: string;
}
export interface ISectionItemLessonUpdatePayload extends InferType<typeof updateSectionItemLessonSchema> {}
export interface ISectionItemDeleteManyPayload extends InferType<typeof deleteManySectionItemsSchema> {}
export interface ISectionItemPublishContentPayload extends InferType<typeof publishSectionItemContentSchema> {}
export interface ISectionItemReorderPayload extends InferType<typeof reorderSectionItemsSchema> {}
