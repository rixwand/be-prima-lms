import { $Enums } from "@prisma/client";
import * as yup from "yup";

const SECTION_TYPES = Object.values($Enums.SectionItemType) as readonly $Enums.SectionItemType[];

const emptyDoc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: {
        textAlign: null,
      },
    },
  ],
};

const tiptapContentSchema = yup
  .object({
    type: yup.string().oneOf(["doc"]).required(),
    content: yup.array().required(),
  })
  .default(emptyDoc)
  .optional();

export const sectionItemSchema = yup
  .object({
    title: yup.string().required(),
    summary: yup.string().optional(),
    durationSec: yup.number().optional(),
    isPreview: yup.boolean().default(false).optional(),
    type: yup.mixed<$Enums.SectionItemType>().defined().oneOf(SECTION_TYPES).required(),
    content: yup.mixed().when("type", ([type]) => {
      switch (type) {
        case $Enums.SectionItemType["LESSON"]:
          return yup
            .object({
              lesson: tiptapContentSchema.required(),
            })
            .default({ lesson: emptyDoc })
            .optional();

        case $Enums.SectionItemType["QUIZ"]:
          return yup
            .object({
              quiz: yup.object({ description: yup.string().required() }).required().noUnknown(),
            })
            .default({ quiz: { description: "Quiz description here..." } })
            .optional();

        default:
          return yup.mixed().strip();
      }
    }),
  })
  .required()
  .noUnknown();

export const sectionItemIdParamSchema = yup
  .object({
    itemId: yup.number().integer().positive().required(),
  })
  .required()
  .noUnknown();

export const createSectionItemSchema = yup.array().of(sectionItemSchema.required()).min(1).required();

export const updateSectionItemLessonSchema = yup
  .object({
    summary: yup.string().optional(),
    contentJson: tiptapContentSchema,
  })
  .test("at-least-one-field", "At least one field must be provided", value => {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return true;
    return Object.keys(value).length > 0;
  })
  .required()
  .noUnknown();

export const deleteManySectionItemsSchema = yup
  .object({
    ids: yup
      .array()
      .of(yup.number().integer().positive().required())
      .min(1, "At least one id must be provided")
      .required("ids field is required"),
  })
  .required()
  .noUnknown();

export const publishSectionItemContentSchema = yup
  .object({
    newDraft: yup
      .object({
        type: yup.string().oneOf(["doc"]).required(),
        content: yup.array().required(),
      })
      .nullable()
      .optional(),
  })
  .required()
  .noUnknown();

const reorderSectionItemSchema = yup
  .object({
    id: yup.number().integer().positive().required(),
    position: yup.number().integer().positive().required(),
  })
  .required()
  .noUnknown();

export const reorderSectionItemsSchema = yup
  .object({
    reorders: yup
      .array()
      .of(reorderSectionItemSchema)
      .test("unique-ids", "Duplicate section item ids are not allowed", reorders => {
        if (!Array.isArray(reorders)) return true;
        const ids = reorders.map(item => {
          if (!item || typeof item !== "object" || Array.isArray(item)) return Number.NaN;
          return Number((item as { id?: unknown }).id);
        });
        return ids.length === new Set(ids).size;
      })
      .test("unique-positions", "Duplicate positions are not allowed", reorders => {
        if (!Array.isArray(reorders)) return true;
        const positions = reorders.map(item => {
          if (!item || typeof item !== "object" || Array.isArray(item)) return Number.NaN;
          return Number((item as { position?: unknown }).position);
        });
        return positions.length === new Set(positions).size;
      })
      .min(1, "At least one reorder item is required")
      .required("reorders is required"),
  })
  .required()
  .noUnknown();
