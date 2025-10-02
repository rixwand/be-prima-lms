import type { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { ILessonCreateEntity } from "./lesson.types";
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
};
