import { prisma } from "../../../common/libs/prisma";
import { slugify } from "../../../common/utils/course";
import { ICourseCreateEntity } from "./course.types";
export const courseRepo = {
  async create(course: ICourseCreateEntity, tags: string[]) {
    return prisma.course.create({
      data: {
        ...course,
        tags: {
          create: tags.map(tag => ({
            tag: {
              connectOrCreate: {
                where: { slug: slugify(tag) },
                create: { name: tag, slug: slugify(tag) },
              },
            },
          })),
        },
      },
      select: {
        slug: true,
        id: true,
      },
    });
  },

  async findById(id: number) {
    return prisma.course.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
  },

  async countAll() {
    return prisma.course.count();
  },

  async list(page: number, limit: number) {
    return prisma.course.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
    });
  },
};
