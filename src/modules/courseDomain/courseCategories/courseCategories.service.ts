import { ApiError } from "../../../common/utils/http";
import { courseCategoryRepo } from "./courseCategories.repository";
import {
  CourseCategoryCreateManyPayload,
  CourseCategoryCreatePayload,
  CourseCategoryListParams,
  CourseCategoryUpdatePayload,
} from "./courseCategories.types";

export const courseCategoryService = {
  async create(payload: CourseCategoryCreatePayload) {
    return courseCategoryRepo.create(payload);
  },

  async createMany(payload: CourseCategoryCreateManyPayload) {
    return courseCategoryRepo.createMany(payload);
  },

  async update(id: number, category: CourseCategoryUpdatePayload) {
    return courseCategoryRepo.update(id, category);
  },

  async delete(id: number) {
    const category = await courseCategoryRepo.findById(id);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    return courseCategoryRepo.delete(id);
  },

  async deleteMany(ids: number[]) {
    return courseCategoryRepo.deleteMany(ids);
  },

  async list(params: CourseCategoryListParams) {
    const [categories, total] = await Promise.all([courseCategoryRepo.list(params), courseCategoryRepo.count()]);

    return {
      categories,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPage: Math.ceil(total / params.limit),
      },
    };
  },

  async get(id: number) {
    const category = await courseCategoryRepo.findById(id);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    return category;
  },
};
