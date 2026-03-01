import * as yup from "yup";
export const listEnrolledCourseParamsValidation = yup
  .object({
    search: yup.string().optional().min(3).max(255),
    page: yup.number().integer().positive().default(1).optional(),
    limit: yup.number().integer().positive().default(10).optional(),
  })
  .required()
  .noUnknown();
