import * as yup from "yup";

export const createCategorySchema = yup
  .object({
    category: yup.string().trim().min(2, "Category name is too short").max(100, "Category name is too long").required(),
  })
  .required()
  .noUnknown(true);

export const createManyCategorySchema = yup
  .object({
    categories: yup
      .array()
      .of(yup.string().trim().min(2, "Category name is too short").max(100, "Category name is too long").required())
      .min(1)
      .required(),
  })
  .required()
  .noUnknown(true);

export const deleteManyCategorySchema = yup
  .object({
    ids: yup.array().of(yup.number().integer().positive().required()).min(1).required(),
  })
  .required()
  .noUnknown(true);

export const updateCategorySchema = yup
  .object({
    name: yup.string().trim().min(2).max(100).optional(),
    slug: yup
      .string()
      .trim()
      .lowercase()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and kebab-case (e.g. web-development)")
      .min(2, "Slug is too short")
      .max(100, "Slug is too long"),
  })
  .required()
  .noUnknown(true)
  .test("at-least-one-field", "At least one field must be provided", value => !!value && Object.keys(value).length > 0);

export const listCategoryParams = yup
  .object({
    page: yup.number().integer().positive().default(1).optional(),
    limit: yup.number().integer().positive().default(10).optional(),
    search: yup.string().optional(),
  })
  .noUnknown();
