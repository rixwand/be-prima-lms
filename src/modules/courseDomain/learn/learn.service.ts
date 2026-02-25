import { ApiError } from "../../../common/utils/http";
import { MetaApprovedPayload } from "../course/course.types";
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
};
