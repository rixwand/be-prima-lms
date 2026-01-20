import { BlockType } from "@prisma/client";
import * as yup from "yup";

const blockTypes = Object.values(BlockType) as BlockType[];

const contentProvided = (
  value:
    | {
        textJson?: unknown;
        url?: string | null | undefined;
        meta?: unknown;
      }
    | undefined
) => {
  if (!value) return false;
  const { textJson, url, meta } = value;
  const hasText = textJson !== undefined && textJson !== null;
  const hasUrl = url !== undefined && url !== null;
  const hasMeta = meta !== undefined && meta !== null;
  return hasText || hasUrl || hasMeta;
};

export const createLessonBlockSchema = yup
  .object({
    type: yup.mixed<BlockType>().oneOf(blockTypes, "Invalid block type").required("Block type is required"),
    textJson: yup.mixed().nullable().optional(),
    url: yup.string().url().nullable().optional(),
    meta: yup.mixed().nullable().optional(),
  })
  .test("content-provided", "At least one of textJson, url, or meta must be provided", contentProvided)
  .required()
  .noUnknown();

export const updateLessonBlockSchema = yup
  .object({
    type: yup.mixed<BlockType>().oneOf(blockTypes, "Invalid block type").optional(),
    textJson: yup.mixed().nullable().optional(),
    url: yup.string().url().nullable().optional(),
    meta: yup.mixed().nullable().optional(),
  })
  .test("some-field-provided", "At least one field must be provided", value => {
    if (!value) return false;
    return Object.values(value).some(v => v !== undefined);
  })
  .noUnknown()
  .required();
