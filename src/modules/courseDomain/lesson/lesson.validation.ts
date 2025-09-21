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
