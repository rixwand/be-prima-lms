import { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { ApiError } from "../../../common/utils/http";
import { ILessonCreateEntity } from "./lesson.types";

export type LessonRow = { id: number; position: number };
export type LessonCreateInput = {
  sectionId: number;
  slug: string;
  title: string;
  summary?: string | null;
  durationSec?: number | null;
  isPreview?: boolean;
  position: number;
};

export const lessonRepo = {
  async createMany(lessons: ILessonCreateEntity[]) {
    return prisma.lesson.createMany({ data: lessons });
  },

  async getMaxLessonPosition(sectionId: number) {
    return prisma.lesson.aggregate({
      where: { sectionId },
      _max: { position: true },
    });
  },

  async update(lesson: Prisma.LessonUpdateInput, ids: { id: number; sectionId: number }) {
    return prisma.lesson.update({
      where: ids,
      data: lesson,
    });
  },

  async remove(props: { id: number; sectionId: number }) {
    return prisma.lesson.delete({ where: props });
  },

  async removeMany({ ids, sectionId }: { ids: number[]; sectionId: number }) {
    return prisma.lesson.deleteMany({
      where: {
        sectionId,
        id: { in: ids },
      },
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
    select: { id?: boolean; position?: boolean } = { id: true, position: true }
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
