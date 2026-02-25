import { CourseMetaDraft } from "@prisma/client";
import { ApiError } from "../../../common/utils/http";
// import { discountRepo } from "../courseDiscountDraft/courseDiscount.repository";
import courseDraftRepo from "../courseDraft/metaDraft.repository";
import { courseRepo } from "./course.repository";
import {
  IListMyCourseParams,
  IListPublicCourseParams,
  IListPublicTagsParams,
  MetaApprovedPayload,
} from "./course.types";
export const courseService = {
  async applyMetaDraft(courseId: number) {
    const metaB = await courseDraftRepo.getMetaB(courseId);
    if (!metaB) throw new ApiError(404, "Course draft not found");
    return courseRepo.applyMetaDraft({ courseId, data: metaB, tier: "B" });
  },

  async listPublicCourses(params: IListPublicCourseParams) {
    const [courses, total] = await courseRepo.listPublicCourses(params);
    return {
      courses: courses.map(c => ({ ...c, metaApproved: c.metaApproved?.payload })),
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
    const data = courses.map(c => {
      return {
        ...c,
        canApplyTierB: computeRequiresApplyMeta({
          draft: c.metaDraft!,
          approved: c.metaApproved?.payload as MetaApprovedPayload,
        }),
      };
    });
    return {
      courses: data,
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
    const { metaApproved, tags, categories } = course;
    return {
      ...course,
      metaApproved: metaApproved ? { ...(metaApproved.payload as Object) } : null,
      tags: tags.map(t => ({ ...t.tag })),
      categories: categories.map(c => ({ ...c.category })),
    };
  },

  async get(id: number) {
    const course = await courseRepo.findById(id, {
      include: {
        metaDraft: {
          include: {
            draftCategories: { omit: { draftId: true }, include: { category: { select: { name: true } } } },
            draftTags: { select: { tag: true } },
            draftDiscounts: true,
          },
        },
        metaApproved: { select: { payload: true } },
        publishRequest: {
          select: { notes: true, id: true, status: true },
        },
        categories: { omit: { courseId: true }, include: { category: { select: { name: true } } } },
        tags: { select: { tag: true } },
        discounts: true,
        sections: {
          include: {
            lessons: {
              orderBy: { position: "asc" },
              omit: { contentDraft: true, contentLive: true },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });
    if (!course) throw new ApiError(404, "Course not found");
    const { metaApproved, metaDraft, tags, categories, ...data } = course;
    const { draftCategories, draftDiscounts, draftTags, ...draft } = metaDraft!;
    return {
      ...data,
      tags: tags.map(t => t.tag),
      categories: categories.map(c => ({
        id: c.categoryId,
        name: c.category.name,
        isPrimary: c.isPrimary,
      })),
      metaApproved: metaApproved?.payload,
      metaDraft: {
        ...metaDraft,
        draftCategories: draftCategories.map(c => ({
          id: c.categoryId,
          name: c.category.name,
          isPrimary: c.isPrimary,
        })),
        draftTags: draftTags.map(c => c.tag),
      },
      canApplyTierB: computeRequiresApplyMeta({ draft, approved: metaApproved?.payload as MetaApprovedPayload }),
    };
  },
};

const computeRequiresApplyMeta = ({ draft, approved }: { draft: CourseMetaDraft; approved?: MetaApprovedPayload }) => {
  const TIER_B_FIELDS: (keyof MetaApprovedPayload)[] = [
    "title",
    "shortDescription",
    "descriptionJson",
    "coverImage",
    "previewVideo",
  ];
  if (!approved) return false;

  return TIER_B_FIELDS.some(field => {
    return draft[field] !== approved[field];
  });
};
