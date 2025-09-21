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
};
