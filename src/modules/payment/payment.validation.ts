import * as yup from "yup";
export const createCoursePayment = yup
  .object({
    courseId: yup.number().integer().positive().required(),
    code: yup.string().max(20).min(3).optional(),
  })
  .required()
  .noUnknown();
