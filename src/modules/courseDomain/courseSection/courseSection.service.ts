import { courseSectionRepo } from "./courseSection.repository";

export const courseSectionService = {
  async appendSection(arrayTitle: string[], courseId: number) {
    const { _max } = await courseSectionRepo.getMaxSectionPosition(courseId);
    let position = (_max.position ?? 0) + 1;
    const sections = arrayTitle.map(title => {
      const row = { title, position, courseId: courseId };
      position++;
      return row;
    });
    return courseSectionRepo.createMany(sections);
  },
};
