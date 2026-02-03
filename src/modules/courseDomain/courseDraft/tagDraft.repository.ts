import { prisma } from "../../../common/libs/prisma";
import { slugify } from "../../../common/utils/course";

export default {
  async disconnectBySlug(slugs: string[], draftId: number) {
    return prisma.courseDraftTag.deleteMany({
      where: { draftId, tag: { slug: { in: slugs } } },
    });
  },

  async connectOrCreate(tags: string[], id: number) {
    return prisma.courseMetaDraft.update({
      where: { id },
      data: {
        draftTags: {
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

  async getCourseDraftTags(draftId: number) {
    return prisma.courseDraftTag.findMany({ where: { draftId }, select: { tagId: true } });
  },
};
