import { ApiError } from "../../common/utils/http";
import { courseRepo } from "../course/course.repository";
import { courseSectionRepo } from "./courseSection.repository";

type UserAttr = { id: number; role_id: number };
export const courseSectionService = {
  async appendSection({ user, input }: { user: UserAttr; input: { arrayTitle: string[]; courseId: number } }) {
    const isCourseAvailable = await courseRepo.findByOwnerAndId(input.courseId, user.id);
    if (!isCourseAvailable) throw new ApiError(404, "Course not found");
    const { _max } = await courseSectionRepo.getMaxSectionPosition(input.courseId);
    let position = (_max.position ?? 0) + 1;
    const sections = input.arrayTitle.map(title => {
      const row = { title, position, courseId: input.courseId };
      position++;
      return row;
    });
    return courseSectionRepo.createMany(sections);
  },
};
