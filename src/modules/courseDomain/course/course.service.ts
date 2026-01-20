import { slugify } from "../../../common/utils/course";
import { flattenObject, optionalizeUndefined } from "../../../common/utils/function";
import { ApiError } from "../../../common/utils/http";
import { discountRepo } from "../courseDiscount/courseDiscount.repository";
import { IUpdateDiscount } from "../courseDiscount/courseDiscount.types";
import courseDraftRepo from "../courseDraft/courseDraft.repository";
import { discountDraftRepo } from "../courseDraft/discountDraft.repository";
import { courseRepo } from "./course.repository";
import {
  CourseStatus,
  ICourseCategoriesCreateEntity,
  ICourseCreate,
  ICourseUpdate,
  ICourseUpdateTags,
  IListMyCourseParams,
  IListPublicCourseParams,
  IListPublicTagsParams,
} from "./course.types";
export const courseService = {
  async create(course: ICourseCreate, ownerId: number) {
    const { discount, tags, sections, categories, ...courseData } = course;
    return courseRepo.create({
      course: {
        ...courseData,
        ownerId,
        slug: slugify(courseData.title),
      },
      tags,
      categories,
      sections,
      discount: discount ? optionalizeUndefined(discount) : undefined,
    });
  },

  async update({ course, courseId, status }: { course: ICourseUpdate; courseId: number; status: CourseStatus }) {
    const { title, discounts, ...courseData } = course;
    console.log("CourseStatus: ", status);
    if (status == "PUBLISHED") {
      let discountsRes;
      if (discounts && discounts.length > 0) {
        const draftId = await discountDraftRepo.ensureDiscountDraft(courseId);
        discountsRes = await Promise.all(
          discounts.map(async discount => {
            await discountDraftRepo.upsert(discount as IUpdateDiscount, draftId);
          }),
        );
      }
      const draftId = await courseDraftRepo.upsertMeta({ courseId, data: { ...courseData, title } });
      return { ...draftId, discounts: discountsRes };
    } else {
      const data = optionalizeUndefined(courseData);
      if (discounts && discounts.length > 0) {
        await Promise.all(
          discounts.map(async discount => {
            await discountRepo.upsert(discount as IUpdateDiscount, courseId);
          }),
        );
      }
      return courseRepo.update(
        {
          ...data,
          ...(title ? { title, slug: slugify(title) } : {}),
        },
        courseId,
      );
    }
  },

  async updateTags(tagObj: ICourseUpdateTags, courseId: number) {
    const { createOrConnect, disconnectSlugs } = tagObj;
    let removed = 0;
    if (disconnectSlugs && disconnectSlugs.length > 0) {
      const { count } = await courseRepo.disconnectTagsBySlug(disconnectSlugs, courseId);
      removed = +count;
    }
    let added = 0;
    if (createOrConnect && createOrConnect.length > 0) {
      await courseRepo.connectOrCreateTags(createOrConnect, courseId);
      added = +createOrConnect.length;
    }
    return { message: `Success add ${added} tags and remove ${removed} tags` };
  },

  async updateCategories(courseId: number, categories: ICourseCategoriesCreateEntity) {
    return courseRepo.updateCategories(courseId, categories);
  },

  async listPublicCourses(params: IListPublicCourseParams) {
    const [courses, total] = await courseRepo.listPublicCourses(params);
    return {
      courses,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPage: Math.ceil(total / params.limit),
      },
    };
  },

  async listPublicTags(params: IListPublicTagsParams) {
    const [tags, total] = await courseRepo.listPublicTags(params);
    return {
      tags,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPage: Math.ceil(total / params.limit),
      },
    };
  },

  async remove(courseId: number) {
    return courseRepo.remove(courseId);
  },

  async removeMany(ids: number[]) {
    return courseRepo.removeMany(ids);
  },

  async myCourses({ userId, params, params: { page, limit } }: { userId: number; params: IListMyCourseParams }) {
    const [courses, total] = await courseRepo.listCourseByUser({ userId, params });
    return {
      courses,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  },

  async getPreview(slug: string) {
    const course = await courseRepo.findBySlug(slug);
    if (!course) throw new ApiError(404, "Course not found");
    return flattenObject(course);
  },

  async get(id: number) {
    const course = await courseRepo.findById(id, {
      include: {
        coursePublishRequest: {
          select: {
            notes: true,
          },
        },
        tags: { select: { tag: true } },
        discount: true,
        sections: {
          include: {
            lessons: {
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });
    if (!course) throw new ApiError(404, "Course not found");
    return flattenObject(course);
  },

  async removeDiscount(props: { id: number; courseId: number }) {
    return discountRepo.remove(props);
  },
};
