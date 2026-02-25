import { Prisma } from "@prisma/client";
import { prisma, PrismaTx } from "../../../common/libs/prisma";

export default {
  async create(data: { userId: number; courseId: number }, db: PrismaTx = prisma) {
    return db.enrollment.create({ data });
  },

  async get({ courseId, userId }: { courseId: number; userId: number }, db: PrismaTx = prisma) {
    return db.enrollment.findUnique({ where: { userId_courseId: { courseId, userId } } });
  },

  async listCourseByUser(userId: number, search?: string) {
    let whereCourse: Prisma.CourseWhereInput | null = null;
    if (search) {
      whereCourse = {
        OR: [
          { metaApproved: { payload: { path: ["title"], string_contains: search, mode: "insensitive" } } },
          { categories: { some: { category: { name: { contains: search, mode: "insensitive" } } } } },
          { tags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } } },
          { owner: { fullName: { contains: search, mode: "insensitive" } } },
        ],
      };
    }
    return prisma.enrollment.findMany({
      where: { userId, ...(whereCourse && { course: whereCourse }) },
      select: { course: { include: { metaApproved: true } } },
    });
  },
};
