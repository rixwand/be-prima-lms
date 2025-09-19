import * as yup from "yup";
export const createCourseSchema = yup.object({
  title: yup.string().required(),
  status: yup.mixed<"PUBLISHED" | "DRAFT">().oneOf(["PUBLISHED", "DRAFT"]).optional(),
});
