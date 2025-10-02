import { slugify } from "../../../common/utils/course";
import { optionalizeUndefined } from "../../../common/utils/function";
import { courseSectionRepo } from "../courseSection/courseSection.repository";
import { lessonRepo } from "./lesson.repository";
import { ILessonCreateEntity, ILessonsCreate, ILessonUpdate } from "./lesson.types";

export const lessonService = {
  async create(lessons: ILessonsCreate, sectionId: number) {
    await courseSectionRepo.findByIdOrThrow(sectionId);
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

  async update({ title, ...lesson }: ILessonUpdate, ids: { id: number; sectionId: number }) {
    return lessonRepo.update(
      optionalizeUndefined({
        ...lesson,
        title,
        slug: title ? slugify(title) : undefined,
      }),
      ids
    );
  },

  async remove(props: { id: number; sectionId: number }) {
    return lessonRepo.remove(props);
  },

  async removeMany(props: { ids: number[]; sectionId: number }) {
    return lessonRepo.removeMany(props);
  },
};
