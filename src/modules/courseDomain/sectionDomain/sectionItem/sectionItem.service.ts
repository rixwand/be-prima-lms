import { Prisma } from "@prisma/client";
import { withTransaction } from "../../../../common/libs/prisma/transaction";
import { comingSoonLesson, slugify } from "../../../../common/utils/course";
import { ApiError } from "../../../../common/utils/http";
import { courseSectionRepo } from "../courseSection/courseSection.repository";
import { lessonService } from "../lesson/lesson.service";
import { sectionItemRepo } from "./sectionItem.repository";
import {
  ISectionItemLessonUpdatePayload,
  ISectionItemLessonsCreate,
  ISectionItemReorderPayload,
} from "./sectionItem.types";

export const sectionItemService = {
  async list(sectionId: number) {
    const sectionItems = await sectionItemRepo.listSectionItemsInSection(sectionId);
    return sectionItems
      .filter(sectionItem => sectionItem.entity)
      .map(sectionItem => ({
        id: sectionItem.entity!.id,
        sectionId: sectionItem.sectionId,
        slug: sectionItem.slug,
        title: sectionItem.title,
        isPreview: sectionItem.isPreview,
        position: sectionItem.position,
        summary: sectionItem.entity!.summary,
        contentDraft: sectionItem.entity!.contentDraft,
        contentLive: sectionItem.entity!.contentLive,
        publishedAt: sectionItem.publishedAt,
        removedAt: sectionItem.removedAt,
        createdAt: sectionItem.createdAt,
        updatedAt: sectionItem.updatedAt,
      }));
  },

  async createMany(items: ISectionItemLessonsCreate, sectionId: number) {
    await courseSectionRepo.findByIdOrThrow(sectionId);
    if (!items.length) return 0;

    return withTransaction(async tx => {
      await sectionItemRepo.compactSectionItemPositions(sectionId, tx);
      const { _max } = await sectionItemRepo.getMaxPosition(sectionId, tx);
      let position = (_max.position ?? 0) + 1;
      const itemsData = items.map(({ durationSec, summary, content, ...item }) => {
        const row: Omit<Prisma.SectionItemCreateInput, "section"> = {
          ...item,
          position,
          ...(durationSec ? { durationSec } : {}),
          slug: slugify(item.title),
          // TODO: Apply for forum and quiz type condition
          ...(!content
            ? {}
            : item.type == "LESSON"
              ? {
                  lesson: {
                    create: { contentDraft: content, contentLive: comingSoonLesson, summary: summary ?? null },
                  },
                }
              : item.type == "QUIZ"
                ? {
                    quiz: { create: { description: "" } },
                  }
                : {}),
        };
        position += 1;
        return row;
      });
      await sectionItemRepo.createMany(itemsData, sectionId, tx);
      return itemsData.length;
    });
  },

  async update(sectionItemId: number, payload: ISectionItemLessonUpdatePayload) {
    return lessonService.update(
      {
        ...(payload.summary !== undefined ? { summary: payload.summary } : {}),
        ...(payload.contentJson !== undefined ? { contentJson: payload.contentJson } : {}),
      },
      sectionItemId,
    );
  },

  async remove({ id, publishedAt, sectionId }: { id: number; publishedAt: Date | null; sectionId: number }) {
    return withTransaction(async tx => {
      const result = publishedAt
        ? await sectionItemRepo.update(
            id,
            {
              removedAt: new Date(),
            },
            tx,
          )
        : await sectionItemRepo.delete([id], sectionId, tx);

      await sectionItemRepo.compactSectionItemPositions(sectionId, tx);
      return result;
    });
  },

  async removeMany({ ids, sectionId }: { ids: number[]; sectionId: number }) {
    return await withTransaction(async tx => {
      const { count: deleted } = await sectionItemRepo.delete(ids, sectionId, tx);
      const { count: removed } = await sectionItemRepo.updateMany(ids, sectionId, { removedAt: new Date() }, tx);
      await sectionItemRepo.compactSectionItemPositions(sectionId, tx);
      return { count: deleted + removed };
    });
  },

  async reorder(sectionId: number, reorders: ISectionItemReorderPayload["reorders"]) {
    if (!Array.isArray(reorders)) throw new ApiError(400, "Invalid payload");

    const existingList = await sectionItemRepo.listSectionItemPositions(sectionId);
    const existingIds = new Set(existingList.map(item => item.id));

    for (const reorder of reorders) {
      if (!existingIds.has(reorder.id)) {
        throw new ApiError(404, `Section item ${reorder.id} not found in target section`);
      }
    }

    const totalItems = existingList.length;
    if (totalItems === 0) return { newOrder: [] };

    const maxRequestedPosition = reorders.reduce((max, item) => Math.max(max, item.position), 0);
    if (maxRequestedPosition > totalItems) {
      throw new ApiError(400, "Requested positions exceed total section items");
    }

    const sortedExisting = [...existingList].sort((a, b) => a.position - b.position);
    const requestedIds = new Set(reorders.map(item => item.id));
    const remainingExisting = sortedExisting.filter(item => !requestedIds.has(item.id));

    const placement: ({ id: number } | null)[] = Array.from({ length: totalItems }, () => null);
    const sortedReorders = [...reorders].sort((a, b) => a.position - b.position);

    for (const reorder of sortedReorders) {
      const index = reorder.position - 1;
      if (index < 0 || index >= placement.length) {
        throw new ApiError(400, "Section item position is out of range");
      }
      if (placement[index]) {
        throw new ApiError(400, "Duplicate section item position detected");
      }
      placement[index] = { id: reorder.id };
    }

    let remainingIdx = 0;
    for (let i = 0; i < placement.length; i++) {
      if (!placement[i]) {
        const nextExisting = remainingExisting[remainingIdx];
        if (!nextExisting) {
          throw new ApiError(400, "Reorder payload is invalid. Not enough section items to fill positions.");
        }
        placement[i] = { id: nextExisting.id };
        remainingIdx += 1;
      }
    }

    if (remainingIdx !== remainingExisting.length) {
      throw new ApiError(400, "Reorder payload is invalid. Extra section items not accounted for.");
    }

    const newOrder = placement.map((entry, index) => ({ id: entry!.id, position: index + 1 }));
    await sectionItemRepo.updateSectionItemPositions(sectionId, newOrder);
    return { newOrder };
  },
};
