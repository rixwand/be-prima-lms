import { createWithUniqueSlug, slugify } from "../../../common/utils/course";
import { courseRepo } from "./course.repository";
import { ICourseCreate } from "./course.types";
export const courseService = {
  async create(course: ICourseCreate, ownerId: number) {
    const { status, descriptionJson, previewVideo, tags, ...courseData } = course;
    return createWithUniqueSlug(async candidate => {
      return courseRepo.create(
        {
          ...courseData,
          ...(status ? { status } : {}),
          ...(descriptionJson ? { descriptionJson } : {}),
          ...(previewVideo ? { previewVideo } : {}),
          ownerId,
          slug: candidate,
        },
        tags
      );
    }, slugify(course.title));
  },

  async list(page: number, limit: number) {
    const [total, courses] = await Promise.all([courseRepo.countAll(), courseRepo.list(page, limit)]);
    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  },
};
