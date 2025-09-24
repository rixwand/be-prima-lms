import type { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { slugify } from "../../../common/utils/course";
import { optionalizeUndefined } from "../../../common/utils/function";
import { ICourseCreateEntity } from "./course.types";
export const courseRepo = {
  async create(course: ICourseCreateEntity, tags: string[]) {
    const data = optionalizeUndefined(course);
    return prisma.course.create({
      data: {
        ...data,
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
    });
  },

  async update(course: Prisma.CourseUpdateWithoutTagsInput, id: number) {
    return prisma.course.update({
      where: { id },
      data: course,
    });
  },

  async disconnectTagsBySlug(slugs: string[], courseId: number) {
    return prisma.courseTag.deleteMany({
      where: { courseId, tag: { slug: { in: slugs } } },
    });
  },

  async connectOrCreateTags(tags: string[], id: number) {
    return prisma.course.update({
      where: { id },
      data: {
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
