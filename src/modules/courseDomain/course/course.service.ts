import { slugify } from "../../../common/utils/course";
import { optionalizeUndefined } from "../../../common/utils/function";
import { courseRepo } from "./course.repository";
import { ICourseCreate, ICourseUpdate, ICourseUpdateTags } from "./course.types";
export const courseService = {
  async create(course: ICourseCreate, ownerId: number) {
    const { tags, ...courseData } = course;
    return courseRepo.create(
      {
        ...courseData,
        ownerId,
        slug: slugify(courseData.title),
      },
      tags
    );
  },

  async update(course: ICourseUpdate, courseId: number) {
    const { title, ...courseData } = course;
    const data = optionalizeUndefined(courseData);
    return courseRepo.update(
      {
        ...data,
        ...(title ? { title, slug: slugify(title) } : {}),
      },
      courseId
    );
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
