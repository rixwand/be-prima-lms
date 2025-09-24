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
  );
