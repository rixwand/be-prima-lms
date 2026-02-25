import { Prisma } from "@prisma/client";
import { prisma, PrismaTx } from "../../../common/libs/prisma";
import { comingSoonLesson } from "../../../common/utils/course";
import { ApiError } from "../../../common/utils/http";
import { ILessonCreateEntity, ILessonReorderPayload } from "./lesson.types";

export type LessonRow = { id: number; position: number };
export type LessonCreateInput = Extract<ILessonReorderPayload["reorders"][number], { summary?: string | undefined }> & {
  sectionId: number;
  slug: string;
};
export const lessonRepo = {
  async getContent(props: { id: number; sectionId: number }, db: PrismaTx = prisma) {
    return db.lesson.findUnique({
      where: props,
      select: {
        contentDraft: true,
        contentLive: true,
        publishedAt: true,
      },
    });
  },
  async createMany(lessons: ILessonCreateEntity[]) {
    return prisma.lesson.createMany({
      data: lessons.map(({ contentJson, ...l }) => ({
        contentLive: comingSoonLesson,
        contentDraft: contentJson,
        ...l,
      })),
    });
  },

  async getMaxLessonPosition(sectionId: number) {
    return prisma.lesson.aggregate({
      where: { sectionId },
      _max: { position: true },
    });
  },

  async update(lesson: Prisma.LessonUpdateInput, ids: { id: number; sectionId: number }, db: PrismaTx = prisma) {
    return db.lesson.update({
      where: ids,
      data: lesson,
    });
  },

  // TODO: Soft delete if published at != nulL

  async remove({ publishedAt, ...props }: { id: number; sectionId: number; publishedAt: Date | null }) {
    if (publishedAt) {
      return prisma.lesson.update({ where: props, data: { removedAt: new Date() } });
    } else {
      return prisma.lesson.delete({ where: props });
    }
  },

  async removeMany({ ids, sectionId }: { ids: number[]; sectionId: number }) {
    const now = new Date();

    return prisma.$transaction(async tx => {
      const { count } = await tx.lesson.deleteMany({
        where: {
          id: { in: ids },
          sectionId,
          publishedAt: null,
        },
      });

      const { count: updateCount } = await tx.lesson.updateMany({
        where: {
          id: { in: ids },
          sectionId,
          publishedAt: { not: null },
          removedAt: null,
        },
        data: {
          removedAt: now,
        },
      });
      return { count: count + updateCount };
    });
  },

  async list(sectionId: number) {
    return prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { position: "asc" },
    });
  },

  async getLessonsForSection(
    sectionId: number,
    select: { id?: boolean; position?: boolean } = { id: true, position: true },
  ) {
    // Return array of { id, position }
    return prisma.lesson.findMany({
      where: { sectionId },
      select,
    });
  },

  async createOne(input: LessonCreateInput) {
    return prisma.lesson.create({
      data: {
        sectionId: input.sectionId,
        slug: input.slug,
        title: input.title,
        summary: input.summary ?? null,
        position: input.position,
        durationSec: input.durationSec ?? null,
        isPreview: input.isPreview ?? false,
        contentLive: comingSoonLesson,
        contentDraft: input.contentJson,
      },
    });
  },

  // Bulk apply positions using two-phase bump + update, scoped to sectionId
  async bulkApplyPositionsTwoPhase(sectionId: number, items: { id: number; position: number }[]) {
    if (!items || items.length === 0) return;

    // ensure ids unique
    const ids = new Set(items.map(i => i.id));
    if (ids.size !== items.length) {
      throw new ApiError(400, "Duplicate ids in bulk apply");
    }

    // Build VALUES safely with Prisma SQL
    const VALUES = Prisma.join(items.map(it => Prisma.sql`(${it.id}, ${it.position})`));

    await prisma.$transaction(async tx => {
      // Lock rows for this section to prevent concurrent reorder from interfering.
      // This SELECT ... FOR UPDATE will lock matching rows (Postgres).
      await tx.$executeRaw`
        SELECT "id" FROM "lessons"
        WHERE "sectionId" = ${sectionId}
        FOR UPDATE
      `;

      // Phase 1: bump positions up beyond the max
      await tx.$executeRaw`
        UPDATE "lessons"
        SET "position" = "position" + (
          SELECT COALESCE(MAX("position"), 0) + 1 FROM "lessons" WHERE "sectionId" = ${sectionId}
        )
        WHERE "sectionId" = ${sectionId};
      `;

      // Phase 2: apply final positions
      await tx.$executeRaw`
        UPDATE "lessons" AS l
        SET "position" = v."position"
        FROM (VALUES ${VALUES}) AS v("id", "position")
        WHERE l."id" = v."id" AND l."sectionId" = ${sectionId};
      `;
    });
  },
};
