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

  async findSectionItemBridgeByEntityId(
    { sectionId, entityId }: { sectionId: number; entityId: number },
    db: PrismaTx = prisma,
  ) {
    const row = await db.sectionItem.findFirst({
      where: {
        sectionId,
        type: LESSON_TYPE,
        lesson: { is: { id: entityId } },
      },
      select: {
        id: true,
        sectionId: true,
        publishedAt: true,
        lesson: {
          select: { id: true },
        },
      },
    });

    if (!row?.lesson) return null;
    return { id: row.id, sectionId: row.sectionId, entityId: row.lesson.id, publishedAt: row.publishedAt };
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

  async findSectionItemByEntityId(
    {
      sectionId,
      entityId,
    }: {
      sectionId: number;
      entityId: number;
    },
    db: PrismaTx = prisma,
  ) {
    const row = await db.sectionItem.findFirst({
      where: {
        sectionId,
        type: LESSON_TYPE,
        lesson: { is: { id: entityId } },
      },
      select: {
        id: true,
        sectionId: true,
        position: true,
        slug: true,
        title: true,
        durationSec: true,
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
          },
        },
      },
    });

    if (!row?.lesson) return null;
    return {
      ...row,
      entity: row.lesson,
      lesson: undefined,
    };
  },

  async findEntityContentBySection(
    { sectionId, entityId }: { sectionId: number; entityId: number },
    db: PrismaTx = prisma,
  ) {
    const row = await db.sectionItem.findFirst({
      where: {
        sectionId,
        type: LESSON_TYPE,
        lesson: { is: { id: entityId } },
      },
      select: {
        publishedAt: true,
        lesson: true,
      },
    });

    if (!row?.lesson) return null;
    return { ...row.lesson, publishedAt: row.publishedAt };
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

  async listEntityPositionsInSection(sectionId: number, db: PrismaTx = prisma): Promise<EntityPositionRow[]> {
    const rows = await db.sectionItem.findMany({
      where: {
        sectionId,
        type: LESSON_TYPE,
        removedAt: null,
        lesson: { isNot: null },
      },
      select: {
        position: true,
        lesson: {
          select: { id: true },
        },
      },
      orderBy: { position: "asc" },
    });

    const data: EntityPositionRow[] = [];
    for (const row of rows) {
      if (!row.lesson) continue;
      data.push({ id: row.lesson.id, position: row.position });
    }
    return data;
  },

  async listEntityIdsInSection(
    { sectionId, entityIds }: { sectionId: number; entityIds: number[] },
    db: PrismaTx = prisma,
  ) {
    const rows = await db.sectionItem.findMany({
      where: {
        sectionId,
        type: LESSON_TYPE,
        lesson: { is: { id: { in: entityIds } } },
      },
      select: {
        lesson: {
          select: { id: true },
        },
      },
    });

    const ids: number[] = [];
    for (const row of rows) {
      if (!row.lesson) continue;
      ids.push(row.lesson.id);
    }
    return ids;
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

  async updateEntityPositionsInSection(
    sectionId: number,
    items: { id: number; position: number }[],
    db: PrismaTx = prisma,
  ) {
    for (const item of items) {
      await db.sectionItem.updateMany({
        where: {
          sectionId,
          type: LESSON_TYPE,
          lesson: { is: { id: item.id } },
        },
        data: { position: item.position },
      });
    }
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

  async findSectionItemHierarchyByEntityId({
    courseId,
    sectionId,
    entityId,
    ownerId,
  }: {
    courseId: number;
    sectionId: number;
    entityId: number;
    ownerId?: number;
  }) {
    const row = await prisma.sectionItem.findFirst({
      where: {
        sectionId,
        type: LESSON_TYPE,
        lesson: { is: { id: entityId } },
        section: { course: { id: courseId, ...(ownerId ? { ownerId } : {}) } },
      },
      select: {
        sectionId: true,
        publishedAt: true,
        lesson: {
          select: {
            id: true,
          },
        },
        section: {
          select: {
            id: true,
            courseId: true,
            course: { select: { id: true, ownerId: true, publishedAt: true } },
            publishedAt: true,
          },
        },
      },
    });

    if (!row?.lesson) return null;
    return {
      entity: { id: row.lesson.id, publishedAt: row.publishedAt },
      sectionId: row.sectionId,
      section: row.section,
    };
  },

  async findSectionItemHierarchyByItemId({
    courseId,
    sectionId,
    itemId,
    ownerId,
  }: {
    courseId: number;
    sectionId: number;
    itemId: number;
    ownerId?: number;
  }) {
    const row = await prisma.sectionItem.findFirst({
      where: {
        id: itemId,
        sectionId,
        type: LESSON_TYPE,
        lesson: { isNot: null },
        section: { course: { id: courseId, ...(ownerId ? { ownerId } : {}) } },
      },
      select: {
        sectionId: true,
        publishedAt: true,
        lesson: {
          select: {
            id: true,
          },
        },
        section: {
          select: {
            id: true,
            courseId: true,
            course: { select: { id: true, ownerId: true, publishedAt: true } },
            publishedAt: true,
          },
        },
      },
    });

    if (!row?.lesson) return null;
    return {
      entity: { id: row.lesson.id, publishedAt: row.publishedAt },
      sectionId: row.sectionId,
      section: row.section,
    };
  },
};
