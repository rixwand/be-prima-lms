import { prisma, PrismaTx } from "../../../../common/libs/prisma";
import { optionalizeUndefined } from "../../../../common/utils/function";
import { LessonUpdateInput } from "./lesson.types";

export const lessonRepo = {
  async getContent(sectionItemId: number, db: PrismaTx = prisma) {
    return db.lesson.findUnique({
      where: { sectionItemId },
    });
  },

  update: async (
    { lesson, sectionItemId }: { lesson: LessonUpdateInput; sectionItemId: number },
    db: PrismaTx = prisma,
  ) => {
    const lessonData = optionalizeUndefined(lesson);
    const row = await db.lesson.update({ where: { sectionItemId }, data: lessonData });

    return {
      id: row.id,
      sectionItemId: row.sectionItemId,
      summary: row.summary,
      contentDraft: row.contentDraft,
      contentLive: row.contentLive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },
};
