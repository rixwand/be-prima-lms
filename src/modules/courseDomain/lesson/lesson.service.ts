import { slugify } from "../../../common/utils/course";
import { optionalizeUndefined } from "../../../common/utils/function";
import { ApiError } from "../../../common/utils/http";
import { courseSectionRepo } from "../courseSection/courseSection.repository";
import { lessonRepo } from "./lesson.repository";
import { ILessonCreateEntity, ILessonsCreate, ILessonUpdate } from "./lesson.types";

type ReorderExistingLesson = { id: number; position: number };
type ReorderNewLesson = {
  position: number;
  title: string;
  summary?: string;
  durationSec?: number;
  isPreview?: boolean;
  id?: never;
};

export type LessonReorderItem = ReorderExistingLesson | ReorderNewLesson;

function isExistingLesson(item: LessonReorderItem): item is ReorderExistingLesson {
  return (item as ReorderExistingLesson).id !== undefined;
}

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

  async list(sectionId: number) {
    return lessonRepo.list(sectionId);
  },

  async reorderLessons(sectionId: number, listReorder: LessonReorderItem[]) {
    if (!Array.isArray(listReorder)) {
      throw new ApiError(400, "Invalid payload");
    }

    // 1) fetch existing lessons (id, position)
    console.log("section id:  _________________________ \n", sectionId);
    const existingList = await lessonRepo.getLessonsForSection(sectionId, { id: true, position: true });
    console.log("existing List _________________________ \n", existingList);
    const existingIds = new Set(existingList.map(l => l.id));

    // 2) split new vs existing
    const newLessons = listReorder.filter(item => !isExistingLesson(item)) as ReorderNewLesson[];
    const requestedExisting = listReorder.filter(isExistingLesson) as ReorderExistingLesson[];

    // 3) validate requested existing ids belong to this section
    for (const item of requestedExisting) {
      if (!existingIds.has(item.id)) {
        throw new ApiError(404, `Lesson ${item.id} not found in target section`);
      }
    }

    // 4) counts & position bounds
    const totalLessonsAfter = existingList.length + newLessons.length;
    const maxRequestedPosition = listReorder.reduce((max, it) => Math.max(max, it.position), 0);
    if (maxRequestedPosition > totalLessonsAfter) {
      throw new ApiError(400, "Requested positions exceed total lessons after reorder");
    }

    // 5) remainingExisting (sorted by current position)
    const sortedExisting = [...existingList].sort((a, b) => a.position - b.position);
    const requestedExistingIds = new Set(requestedExisting.map(it => it.id));
    const remainingExisting = sortedExisting.filter(l => !requestedExistingIds.has(l.id));

    // 6) placement array
    type FinalEntry =
      | { kind: "existing"; id: number }
      | { kind: "new"; title: string; summary?: string; durationSec?: number; isPreview?: boolean };

    const placement: (FinalEntry | null)[] = Array.from({ length: totalLessonsAfter }, () => null);
    const sortedReorders = [...listReorder].sort((a, b) => a.position - b.position);

    // 7) place explicit items from payload
    for (const item of sortedReorders) {
      const index = item.position - 1;
      if (index < 0 || index >= placement.length) {
        throw new ApiError(400, "Lesson position is out of range");
      }
      if (placement[index]) {
        throw new ApiError(400, "Duplicate lesson position detected");
      }
      if (isExistingLesson(item)) {
        placement[index] = { kind: "existing", id: item.id };
      } else {
        const { id, position, ...i } = item;
        placement[index] = {
          kind: "new",
          ...i,
        };
      }
    }

    // 8) fill empty slots with remaining existing lessons (in their current order)
    let remainingIdx = 0;
    for (let i = 0; i < placement.length; i++) {
      if (!placement[i]) {
        const nextExisting = remainingExisting[remainingIdx];
        if (!nextExisting) {
          throw new ApiError(400, "Reorder payload is invalid. Not enough lessons to fill positions.");
        }
        placement[i] = { kind: "existing", id: nextExisting.id };
        remainingIdx++;
      }
    }

    if (remainingIdx !== remainingExisting.length) {
      throw new ApiError(400, "Reorder payload is invalid. Extra lessons not accounted for.");
    }

    // 9) create new lessons sequentially (with provisional positions) and build finalOrder
    // provisionalPosition = max existing position (so newly created entries get unique positions)
    let provisionalPosition = existingList.reduce((max, l) => Math.max(max, l.position), 0);
    const finalOrder: { id: number; position: number }[] = [];

    for (let i = 0; i < placement.length; i++) {
      const entry = placement[i]!;
      if (entry.kind === "existing") {
        finalOrder.push({ id: entry.id, position: i + 1 });
      } else {
        provisionalPosition += 1;
        // generate slug (keep it reasonably unique using timestamp)
        const slug = slugify(entry.title) + "-" + Date.now().toString(36).slice(-6);

        const created = await lessonRepo.createOne({
          sectionId,
          slug,
          title: entry.title,
          summary: entry.summary ?? null,
          durationSec: entry.durationSec ?? null,
          isPreview: entry.isPreview ?? false,
          position: provisionalPosition,
        });

        // optionally: create lesson blocks if provided — omitted because schema not included

        finalOrder.push({ id: created.id, position: i + 1 });
      }
    }

    // 10) bulk apply positions with two-phase update
    // NOTE: bulkApplyPositionsTwoPhase expects items in any order; it will set final positions.
    console.log("final order before bulk apply: ____________________\n", finalOrder);
    await lessonRepo.bulkApplyPositionsTwoPhase(sectionId, finalOrder);

    // return newOrder
    // (If you want to return the order in canonical array order 1..N, return finalOrder)
    return { newOrder: finalOrder };
  },
};
