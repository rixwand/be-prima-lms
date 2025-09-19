import { createWithUniqueSlug, slugify } from "../../common/utils/course";
import { courseRepo } from "./course.repository";
import { ICourseCreate } from "./course.types";
export const courseService = {
  async create(course: ICourseCreate, ownerId: number) {
    return createWithUniqueSlug(async candidate => {
      const courseData = {
        title: course.title,
        ...(course.status ? { status: course.status } : {}),
        ownerId,
        slug: candidate,
      };
      return courseRepo.create(courseData);
    }, slugify(course.title));
  },
};
