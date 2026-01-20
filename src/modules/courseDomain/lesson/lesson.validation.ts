import * as yup from "yup";
export const createLessonSchema = yup
  .array()
  .of(
    yup
      .object({
        title: yup.string().required(),
        summary: yup.string().optional(),
        durationSec: yup.number().optional(),
        isPreview: yup.boolean().default(false).optional(),
      })
      .required()
  )
  .min(1)
  .required();

export const updateLessonSchema = yup
  .object({
    title: yup.string().optional(),
    summary: yup.string().optional(),
    durationSec: yup.number().optional(),
    isPreview: yup.boolean().optional(),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    value => value != null && Object.keys(value).length > 0
  )
  .noUnknown()
  .required();

export const deleteManyLessonsSchema = yup
  .object({
    ids: yup
      .array()
      .of(yup.number().integer().positive().required())
      .min(1, "At least one id must be provided")
      .required("ids field is required"),
  })
  .noUnknown()
  .required();

const reorderExistingLessonSchema = yup
  .object({
    id: yup.number().integer().positive().required(),
    position: yup.number().integer().positive().required(),
  })
  .required()
  .noUnknown();

const reorderNewLessonSchema = yup
  .object({
    position: yup.number().integer().positive().required(),
    title: yup.string().trim().min(1, "title must not be empty").ensure().required("title is required"),
    summary: yup.string().optional(),
    durationSec: yup.number().integer().min(0).optional(),
    isPreview: yup.boolean().optional(),
  })
  .test("no-id-field", "New lessons must not include an id", value => {
    const candidate = value as { id?: unknown } | undefined;
    return candidate?.id === undefined;
  })
  .noUnknown(true)
  .required();

export const reorderLessonsSchema = yup
  .object({
    reorders: yup
      .array()
      .of(
        yup.lazy(value =>
          value && value.id !== undefined && value.id !== null ? reorderExistingLessonSchema : reorderNewLessonSchema
        )
      )
      .min(1, "At least one reorder item is required")
      .required("reorders is required"),
  })
  .test("unique-ids", "Duplicate lesson ids are not allowed", value => {
    if (!value?.reorders) return true;
    const ids = value.reorders
      .map(r => ("id" in r ? r.id : undefined))
      .filter((id): id is number => typeof id === "number");
    return ids.length === new Set(ids).size;
  })
  .test("unique-positions", "Duplicate positions are not allowed", value => {
    if (!value?.reorders) return true;
    const positions = value.reorders.map(r => Number(r.position));
    return positions.length === new Set(positions).size;
  })
  .required()
  .noUnknown(true);
