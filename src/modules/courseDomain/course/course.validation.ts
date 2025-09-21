import * as yup from "yup";
export const createCourseSchema = yup.object({
  title: yup.string().required(),
  status: yup.mixed<"PUBLISHED" | "DRAFT">().oneOf(["PUBLISHED", "DRAFT"]).optional(),
  coverImage: yup.string().required(),
  previewVideo: yup.string().optional(),
  shortDescription: yup.string().required(),
  descriptionJson: yup.string().optional(),
  priceCurrency: yup.string().optional().default("IDR"),
  priceAmount: yup.number().required(),
  isFree: yup.boolean().optional().default(false),
  tags: yup.array().of(yup.string().required()).min(1).required(),
});
