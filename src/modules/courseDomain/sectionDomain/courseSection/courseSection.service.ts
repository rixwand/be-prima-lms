import { withTransaction } from "../../../../common/libs/prisma/transaction";
import { comingSoonLesson, slugify } from "../../../../common/utils/course";
import { ApiError } from "../../../../common/utils/http";
import { CourseStatus } from "../../course/course.types";
import lessonProgressRepository from "../../learnProgress/learnProgress.repository";
import { sectionItemService } from "../sectionItem/sectionItem.service";
import type { ISectionItemLessonsCreate, ISectionItemPayload } from "../sectionItem/sectionItem.types";
import { courseSectionRepo } from "./courseSection.repository";

type ReorderExistingSection = { id: number; position: number };
type ReorderNewSection = {
  position: number;
  title: string;
  items?: ISectionItemPayload[] | undefined;
  id?: never;
};

type ReorderItem = ReorderExistingSection | ReorderNewSection;

function isExistingSection(item: ReorderItem): item is ReorderExistingSection {
  return Object.prototype.hasOwnProperty.call(item, "id");
}

export const courseSectionService = {
  async listByCourse(courseId: number) {
    return courseSectionRepo.getSectionsWithLessons(courseId);
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

  async appendSectionsWithLessons(
    sections: Array<{
      title: string;
      isPublished?: boolean | undefined;
      items?:
        | Array<
            ISectionItemPayload & {
              isPublished?: boolean | undefined;
            }
          >
        | undefined;
    }>,
    courseId: number,
  ) {
    return withTransaction(async tx => {
      const { _max } = await tx.courseSection.aggregate({
        where: { courseId },
        _max: { position: true },
      });
      let sectionPosition = (_max.position ?? 0) + 1;
      let itemCount = 0;
      const now = new Date();

      for (const section of sections) {
        const createdSection = await tx.courseSection.create({
          data: {
            title: section.title,
            position: sectionPosition,
            courseId,
            ...(section.isPublished ? { publishedAt: now } : {}),
          },
        });
        sectionPosition += 1;

        if (!section.items?.length) continue;

        const slugCounter = new Map<string, number>();
        for (const [index, item] of section.items.entries()) {
          const baseSlug = slugify(item.title) || "item";
          const nextIndex = (slugCounter.get(baseSlug) ?? 0) + 1;
          slugCounter.set(baseSlug, nextIndex);
          const slug = `${baseSlug}-${createdSection.id}-${nextIndex}-${Date.now().toString(36).slice(-4)}`;

          await tx.sectionItem.create({
            data: {
              sectionId: createdSection.id,
              type: item.type,
              slug,
              title: item.title,
              isPreview: item.isPreview ?? false,
              ...(item.isPublished ? { publishedAt: now } : {}),
              position: index + 1,
              ...(!item.content
                ? {}
                : item.type == "LESSON"
                  ? {
                      lesson: {
                        create: {
                          summary: item.summary ?? null,
                          contentLive: item.isPublished ? item.content : comingSoonLesson,
                          contentDraft: item.content,
                        },
                      },
                    }
                  : {}),
            },
          });
          itemCount += 1;
        }
      }

      return { sectionCount: sections.length, itemCount };
    });
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
      | { kind: "new"; title: string; items?: ISectionItemPayload[] | undefined };

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
        placement[index] = { kind: "new", title: item.title, items: item.items };
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

        if (entry.items && entry.items.length > 0) {
          const itemsToCreate: ISectionItemLessonsCreate = entry.items.map(item => ({
            title: item.title,
            summary: item.summary,
            durationSec: item.durationSec,
            isPreview: item.isPreview ?? false,
            content: item.content,
            type: item.type,
          }));
          await sectionItemService.createMany(itemsToCreate, createdSection.id);
        }

        finalOrder.push({ id: createdSection.id, position: i + 1 });
      }
    }

    const newOrder = finalOrder.reverse();
    await courseSectionRepo.bulkApplyPositionsTwoPhase(courseId, newOrder);
    return { newOrder };
  },

  async remove(ids: { id: number; courseId: number }) {
    const result = await courseSectionRepo.remove(ids);
    await courseSectionRepo.compactPositions(ids.courseId);
    return result;
  },

  async removeMany(props: { ids: number[]; courseId: number }) {
    const result = await courseSectionRepo.removeMany(props);
    await courseSectionRepo.compactPositions(props.courseId);
    return result;
  },

  async publish({
    courseStatus,
    ...props
  }: {
    courseId: number;
    id: number;
    publishedAt: Date | null;
    courseStatus: CourseStatus;
  }) {
    if (props.publishedAt) throw new ApiError(400, "Section already published");
    return withTransaction(async tx => {
      const section = await courseSectionRepo.countItems(props, tx);
      if (!section || section._count.lessons == 0)
        throw new ApiError(404, "Section must have at least 1 published items");
      const published = await courseSectionRepo.publish(props, tx);
      if (courseStatus == "PUBLISHED")
        await lessonProgressRepository.createPublishedSection({ courseId: props.courseId, sectionId: props.id }, tx);
      return published;
    });
  },
};
