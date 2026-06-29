import { Prisma, SectionItemType } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { PrismaTx, prisma } from "../../../../common/libs/prisma";
import { withTransaction } from "../../../../common/libs/prisma/transaction";

const LESSON_TYPE: SectionItemType = "LESSON";

export type EntityPositionRow = { id: number; position: number };
export type SectionItemPositionRow = { id: number; position: number };

type ContentType =
  | { type: "LESSON"; lesson: InputJsonValue }
  | { type: "QUIZ"; quiz: InputJsonValue }
  | { type: "FORUM"; forum: InputJsonValue };

export const sectionItemRepo = {
  async getMaxPosition(sectionId: number, db: PrismaTx = prisma) {
    return db.sectionItem.aggregate({
      where: { sectionId, removedAt: null },
      _max: { position: true },
    });
  },

  createMany: async (
    inputs: Omit<Prisma.SectionItemCreateInput, "section">[],
    sectionId: number,
    db?: Exclude<PrismaTx, typeof prisma>,
  ) => {
    const createRows = async (tx: Exclude<PrismaTx, typeof prisma>) => {
      for (const data of inputs) {
        await tx.sectionItem.create({ data: { sectionId, ...data } });
      }
    };

    return db ? createRows(db) : withTransaction(createRows);
  },

  async update(
    id: number,
    data: {
      title?: string;
      slug?: string;
      durationSec?: number;
      isPreview?: boolean;
      position?: number;
      publishedAt?: Date | null;
      removedAt?: Date | null;
    },
    db: PrismaTx = prisma,
  ) {
    return await db.sectionItem.update({ where: { id }, data });
  },

  updateMany: async (
    ids: number[],
    sectionId: number,
    data: Prisma.SectionItemUpdateManyMutationInput,
    db: PrismaTx = prisma,
  ) => {
    return db.sectionItem.updateMany({
      where: { id: { in: ids }, sectionId },
      data,
    });
  },
  async listSectionItemsInSection(sectionId: number, db: PrismaTx = prisma) {
    const rows = await db.sectionItem.findMany({
      where: {
        sectionId,
        type: LESSON_TYPE,
        removedAt: null,
        lesson: { isNot: null },
      },
      orderBy: { position: "asc" },
      select: {
        sectionId: true,
        position: true,
        slug: true,
        title: true,
        isPreview: true,
        publishedAt: true,
        removedAt: true,
        createdAt: true,
        updatedAt: true,
        lesson: {
          select: {
            id: true,
            summary: true,
            contentDraft: true,
            contentLive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return rows.map(row => ({
      ...row,
      entity: row.lesson,
      lesson: undefined,
    }));
  },

  async delete(ids: number[], sectionId: number, db: PrismaTx = prisma) {
    return db.sectionItem.deleteMany({
      where: {
        id: { in: ids },
        publishedAt: null,
        sectionId,
      },
    });
  },

  async listSectionItemPositions(sectionId: number, db: PrismaTx = prisma): Promise<SectionItemPositionRow[]> {
    return db.sectionItem.findMany({
      where: { sectionId, removedAt: null },
      select: { id: true, position: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
  },

  async parkRemovedSectionItemPositions(sectionId: number, db: PrismaTx = prisma) {
    const removedItems = await db.sectionItem.findMany({
      where: { sectionId, removedAt: { not: null } },
      select: { id: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    if (!removedItems.length) return [];

    const { _max } = await db.sectionItem.aggregate({
      where: { sectionId },
      _max: { position: true },
    });

    const parked = removedItems.map((item, index) => ({ id: item.id, position: (_max.position ?? 0) + index + 1 }));
    for (const item of parked) {
      await db.sectionItem.updateMany({
        where: { sectionId, id: item.id },
        data: { position: item.position },
      });
    }

    return parked;
  },

  async compactSectionItemPositions(sectionId: number, db: PrismaTx = prisma) {
    await this.parkRemovedSectionItemPositions(sectionId, db);
    const items = await this.listSectionItemPositions(sectionId, db);
    const compacted = items.map((item, index) => ({ id: item.id, position: index + 1 }));
    await this.updateSectionItemPositions(sectionId, compacted, db);
    return compacted;
  },

  async updateSectionItemPositions(
    sectionId: number,
    items: { id: number; position: number }[],
    db: PrismaTx = prisma,
  ) {
    if (!items.length) return;

    const { _max } = await db.sectionItem.aggregate({
      where: { sectionId },
      _max: { position: true },
    });
    const offset = (_max.position ?? 0) + items.length + 1;

    await db.sectionItem.updateMany({
      where: { sectionId, id: { in: items.map(item => item.id) } },
      data: { position: { increment: offset } },
    });

    for (const item of items) {
      await db.sectionItem.updateMany({
        where: { sectionId, id: item.id },
        data: { position: item.position },
      });
    }
  },
};
