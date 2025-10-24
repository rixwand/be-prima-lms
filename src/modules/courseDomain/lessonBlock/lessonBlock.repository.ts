import type { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";

export const lessonBlockRepo = {
  async list(lessonId: number) {
    return prisma.lessonBlock.findMany({
      where: { lessonId },
      orderBy: { position: "asc" },
    });
  },

  async getMaxPosition(lessonId: number) {
    return prisma.lessonBlock.aggregate({
      where: { lessonId },
      _max: { position: true },
    });
  },

  async create(block: Prisma.LessonBlockUncheckedCreateInput) {
    return prisma.lessonBlock.create({ data: block });
  },

  async update(block: Prisma.LessonBlockUncheckedUpdateInput, id: number) {
    return prisma.lessonBlock.update({
      where: { id },
      data: block,
    });
  },

  async remove(id: number) {
    return prisma.lessonBlock.delete({ where: { id } });
  },

  async findById(id: number) {
    return prisma.lessonBlock.findUnique({ where: { id } });
  },
};
