import { slugify } from "../../../common/utils/course";
import { ApiError } from "../../../common/utils/http";
import { courseSectionRepo } from "../courseSection/courseSection.repository";
import { lessonRepo } from "./lesson.repository";
import { ILessonCreateEntity, ILessonsCreate } from "./lesson.types";

export const lessonService = {
  async create(lessons: ILessonsCreate, sectionId: number) {
    if (await sectionNotAvailable(sectionId)) throw new ApiError(404, "Section not found");
    const { _max } = await lessonRepo.getMaxLessonPosition(sectionId);
    let position = (_max.position ?? 0) + 1;
    const lessonData = lessons.map(({ durationSec, summary, ...lesson }) => {
      const row: ILessonCreateEntity = {
        ...lesson,
        position,
        sectionId,
        slug: slugify(lesson.title),
        ...(durationSec ? { durationSec } : {}),
        ...(summary ? { summary } : {}),
      };
      position++;
      return row;
    });
    return lessonRepo.createMany(lessonData);
  },
};

const sectionNotAvailable = async (id: number) => {
  const section = await courseSectionRepo.findById(id);
  return !section;
};
