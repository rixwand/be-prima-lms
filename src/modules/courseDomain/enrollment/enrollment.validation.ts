import * as yup from "yup";
export const listEnrolledCourseParamsValidation = yup
  .object({
    search: yup.string().optional().min(3).max(255),
  })
  .required()
  .noUnknown();
