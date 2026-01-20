import { InferType } from "yup";
import {
  createCategorySchema,
  createManyCategorySchema,
  listCategoryParams,
  updateCategorySchema,
} from "./courseCategories.validation";

export interface CourseCategory {
  name: string;
  slug: string;
}

export interface CourseCategoryCreatePayload extends InferType<typeof createCategorySchema> {}
export interface CourseCategoryCreateManyPayload extends InferType<typeof createManyCategorySchema> {}
export interface CourseCategoryUpdatePayload extends InferType<typeof updateCategorySchema> {}
export interface CourseCategoryListParams extends InferType<typeof listCategoryParams> {}
