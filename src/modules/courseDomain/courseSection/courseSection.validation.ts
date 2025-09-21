import * as yup from "yup";
export const createSectionSchema = yup.object({
  arrayTitle: yup.array().of(yup.string().required()).min(1).required(),
});
