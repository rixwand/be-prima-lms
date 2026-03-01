import { withTransaction } from "../../../common/libs/prisma/transaction";
import { ApiError } from "../../../common/utils/http";
import { MetaApprovedPayload } from "../course/course.types";
import enrollmentRepository from "../enrollment/enrollment.repository";
import lessonProgressRepository from "../lessonProgress/lessonProgress.repository";
import learnRepository from "./learn.repository";

export type Ids = { courseId: number; sectionId: number; lessonId: number };

export default {
  async getCurriculum(courseId: number) {
    const course = await learnRepository.getCurriculum(courseId);
    if (!course) throw new ApiError(404, "Course Not Found");
    const { metaApproved, sections } = course;
    return { title: (metaApproved?.payload as MetaApprovedPayload).title, sections };
  },
  async getLessonContent(props: Ids) {
    const lesson = await learnRepository.getLessonContent(props);
    if (!lesson) throw new ApiError(404, "Lesson Not Found");
    return lesson;
  },
  async startCourse(props: { userId: number; courseId: number }) {
    const lesson = await learnRepository.startCourse(props);
    if (!lesson) throw new ApiError(404, "Lesson not found");
    return { slug: lesson.slug };
  },
  async lessonComplete({ courseId, lessonId, userId }: { userId: number; courseId: number; lessonId: number }) {
    return withTransaction(async tx => {
      const enrollment = await enrollmentRepository.get({ userId, courseId }, tx);
      if (!enrollment) throw new ApiError(404, "Enrollment not found");
      return lessonProgressRepository.lessonComplete({ enrollmentId: enrollment.id, lessonId });
    });
  },
};
