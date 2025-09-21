import { prisma } from "../../../common/libs/prisma";

export const courseSectionRepo = {
  async getMaxSectionPosition(courseId: number) {
    return prisma.courseSection.aggregate({
      where: { courseId },
      _max: { position: true },
    });
  },

  async createMany(sections: { title: string; position: number; courseId: number }[]) {
    return prisma.courseSection.createMany({
      data: sections,
    });
  },

  async findById(id: number) {
    return prisma.courseSection.findUnique({ where: { id } });
  },
};
