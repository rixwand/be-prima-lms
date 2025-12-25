import { ApiError } from "../../../common/utils/http";
import { courseSectionRepo } from "./courseSection.repository";
import { lessonService } from "../lesson/lesson.service";
import type { ILessonsCreate } from "../lesson/lesson.types";

type ReorderNewLesson = {
  title: string;
  summary?: string | undefined;
  durationSec?: number | undefined;
  isPreview?: boolean | undefined;
};

type ReorderExistingSection = { id: number; position: number };
type ReorderNewSection = {
  position: number;
  title: string;
  lessons?: ReorderNewLesson[] | undefined;
  id?: never;
};

type ReorderItem = ReorderExistingSection | ReorderNewSection;

function isExistingSection(item: ReorderItem): item is ReorderExistingSection {
  return Object.prototype.hasOwnProperty.call(item, "id");
}

export const courseSectionService = {
  async listByCourse(courseId: number) {
    const sections = await courseSectionRepo.getSectionsWithLessons(courseId);
    let courseTitle = sections[0]?.course?.title;
    if (courseTitle === undefined) {
      courseTitle = await courseSectionRepo.getCourseTitle(courseId);
    }
    const normalizedSections = sections.map(({ course, ...section }) => section);
    return {
      courseTitle,
      sections: normalizedSections,
    };
  },

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

  async reorder(courseId: number, listReorder: ReorderItem[]) {
    const existingList = await courseSectionRepo.getSectionsForCourse(courseId, { id: true, position: true });
    const existingIds = new Set(existingList.map(section => section.id));

    const newSections = listReorder.filter(item => !isExistingSection(item));
    const requestedExisting = listReorder.filter(isExistingSection);

    for (const item of requestedExisting) {
      if (!existingIds.has(item.id)) {
        throw new ApiError(404, `Course section ${item.id} not found for the targeted course`);
      }
    }

    const totalSectionsAfterReorder = existingList.length + newSections.length;
    const maxRequestedPosition = listReorder.reduce((max, item) => Math.max(max, item.position), 0);
    if (maxRequestedPosition > totalSectionsAfterReorder) {
      throw new ApiError(400, "Requested positions exceed total sections after reorder");
    }

    const sortedExisting = [...existingList].sort((a, b) => a.position - b.position);
    const requestedExistingIds = new Set(requestedExisting.map(item => item.id));
    const remainingExisting = sortedExisting.filter(section => !requestedExistingIds.has(section.id));

    type FinalEntry =
      | { kind: "existing"; id: number }
      | { kind: "new"; title: string; lessons?: ReorderNewLesson[] | undefined };

    const placement: (FinalEntry | null)[] = Array.from({ length: totalSectionsAfterReorder }, () => null);
    const sortedReorders = [...listReorder].sort((a, b) => a.position - b.position);

    for (const item of sortedReorders) {
      const index = item.position - 1;
      if (index < 0 || index >= placement.length) {
        throw new ApiError(400, "Section position is out of range");
      }
      if (placement[index]) {
        throw new ApiError(400, "Duplicate section position detected");
      }
      if (isExistingSection(item)) {
        placement[index] = { kind: "existing", id: item.id };
      } else {
        placement[index] = { kind: "new", title: item.title, lessons: item.lessons };
      }
    }

    let remainingIdx = 0;
    for (let i = 0; i < placement.length; i++) {
      if (!placement[i]) {
        const nextExisting = remainingExisting[remainingIdx];
        if (!nextExisting) {
          throw new ApiError(400, "Reorder payload is invalid. Not enough sections to fill positions.");
        }
        placement[i] = { kind: "existing", id: nextExisting.id };
        remainingIdx++;
      }
    }

    if (remainingIdx !== remainingExisting.length) {
      throw new ApiError(400, "Reorder payload is invalid. Extra sections not accounted for.");
    }

    let provisionalPosition = existingList.reduce((max, section) => Math.max(max, section.position), 0);
    const finalOrder: { id: number; position: number }[] = [];

    for (let i = 0; i < placement.length; i++) {
      const entry = placement[i]!;
      if (entry.kind === "existing") {
        finalOrder.push({ id: entry.id, position: i + 1 });
      } else {
        provisionalPosition += 1;
        const createdSection = await courseSectionRepo.createOne({
          title: entry.title,
          position: provisionalPosition,
          courseId,
        });

        if (entry.lessons && entry.lessons.length > 0) {
          const lessonsToCreate: ILessonsCreate = entry.lessons.map(lesson => ({
            title: lesson.title,
            summary: lesson.summary,
            durationSec: lesson.durationSec,
            isPreview: lesson.isPreview ?? false,
          }));
          await lessonService.create(lessonsToCreate, createdSection.id);
        }

        finalOrder.push({ id: createdSection.id, position: i + 1 });
      }
    }

    const newOrder = finalOrder.reverse();
    await courseSectionRepo.bulkApplyPositionsTwoPhase(courseId, newOrder);
    return { newOrder };
  },

  async remove(ids: { id: number; courseId: number }) {
    return courseSectionRepo.remove(ids);
  },

  async removeMany(props: { ids: number[]; courseId: number }) {
    return courseSectionRepo.removeMany(props);
  },
};
