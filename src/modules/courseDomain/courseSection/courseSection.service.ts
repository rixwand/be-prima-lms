import { applyPartialReorder } from "../../../common/utils/function";
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

  async update(props: { title: string; sectionId: number; courseId: number }) {
    await courseSectionRepo.findByIdOrThrow(props.sectionId);
    return await courseSectionRepo.update(props);
  },

  async reorder(courseId: number, listReorder: { id: number; position: number }[]) {
    const existingList = await courseSectionRepo.getSectionsForCourse(courseId, { id: true, position: true });
    const newOrder = applyPartialReorder(existingList, listReorder);
    await courseSectionRepo.bulkApplyPositionsTwoPhase(courseId, newOrder.reverse());
    return { newOrder };
  },

  async remove(ids: { id: number; courseId: number }) {
    return courseSectionRepo.remove(ids);
  },

  async removeMany(props: { ids: number[]; courseId: number }) {
    return courseSectionRepo.removeMany(props);
  },
};
