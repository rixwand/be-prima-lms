import { prisma } from "../../common/libs/prisma";
export const courseRepo = {
  async create(course: { ownerId: number; title: string; slug: string; status?: "DRAFT" | "PUBLISHED" }) {
    return prisma.course.create({
      data: course,
      select: {
        slug: true,
        id: true,
      },
    });
  },

  async findByOwnerAndId(id: number, ownerId: number) {
    return prisma.course.count({
      where: { ownerId, id },
    });
  },
};
