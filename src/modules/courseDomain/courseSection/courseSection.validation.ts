import * as yup from "yup";
export const createSectionSchema = yup.object({
  arrayTitle: yup.array().of(yup.string().required()).min(1).required(),
});

export const updateSectionSchema = yup.object({
  title: yup.string().required(),
});

const lessonWithinReorderSchema = yup
  .object({
    title: yup.string().required(),
    summary: yup.string().optional(),
    durationSec: yup.number().optional(),
    isPreview: yup.boolean().optional(),
  })
  .noUnknown(true);

const reorderExistingSectionSchema = yup
  .object({
    id: yup.number().integer().positive().required(),
    position: yup.number().integer().positive().required(),
  })
  .noUnknown(true);

const reorderNewSectionSchema = yup
  .object({
    position: yup.number().integer().positive().required(),
    title: yup.string().required(),
    lessons: yup.array().of(lessonWithinReorderSchema).optional(),
  })
  .test("no-id-field", "New sections must not include an id", value => {
    const candidate = value as { id?: unknown } | undefined;
    return candidate?.id === undefined;
  })
  .noUnknown(true);

export const reorderCourseSectionsSchema = yup
  .object({
    reorders: yup
      .array()
      .of(
        yup.lazy(value =>
          value && value.id !== undefined && value.id !== null
            ? reorderExistingSectionSchema
            : reorderNewSectionSchema
        )
      )
      .min(1, "At least one reorder item is required")
      .required(),
  })
  .test("unique-ids", "Duplicate section ids are not allowed", value => {
    if (!value?.reorders) return true;
    const ids = value.reorders
      .map(r => ("id" in r ? r.id : undefined))
      .filter((id): id is number => typeof id === "number");
    return ids.length === new Set(ids).size;
  })
  .test("unique-positions", "Duplicate positions are not allowed", value => {
    if (!value?.reorders) return true;
    const positions = value.reorders.map(r => r.position);
    return positions.length === new Set(positions).size;
  });

export const deleteManyCourseSectionsSchema = yup.object({
  ids: yup
    .array()
    .of(yup.number().integer().positive().required())
    .min(1, "At least one id must be provided")
    .required("ids field is required"),
});
