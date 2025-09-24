import * as yup from "yup";
export const createSectionSchema = yup.object({
  arrayTitle: yup.array().of(yup.string().required()).min(1).required(),
});

export const updateSectionSchema = yup.object({
  title: yup.string().required(),
});

export const reorderCourseSectionsSchema = yup
  .object({
    reorders: yup
      .array()
      .of(
        yup.object({
          id: yup.number().integer().positive().required(),
          position: yup.number().integer().positive().required(),
        })
      )
      .min(1, "At least one reorder item is required")
      .required(),
  })
  .test("unique-ids", "Duplicate section ids are not allowed", value => {
    if (!value?.reorders) return true;
    const ids = value.reorders.map(r => r.id);
    return ids.length === new Set(ids).size;
  })
  .test("unique-positions", "Duplicate positions are not allowed", value => {
    if (!value?.reorders) return true;
    const positions = value.reorders.map(r => r.position);
    return positions.length === new Set(positions).size;
  });
