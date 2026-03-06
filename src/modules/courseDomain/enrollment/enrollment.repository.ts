import { Prisma } from "@prisma/client";
import { prisma, PrismaTx } from "../../../common/libs/prisma";

export default {
  async create(data: { userId: number; courseId: number }, db: PrismaTx = prisma) {
    return db.enrollment.create({ data });
  },

  async get({ courseId, userId }: { courseId: number; userId: number }, db: PrismaTx = prisma) {
    return db.enrollment.findUnique({ where: { userId_courseId: { courseId, userId } } });
  },

  async listCourseByUser(userId: number, { search, skip, take }: { search?: string; take: number; skip: number }) {
    // let whereCourse: Prisma.CourseWhereInput | null = null;
    // if (search) {
    //   whereCourse = {
    //     OR: [
    //       { metaApproved: { payload: { path: ["title"], string_contains: search, mode: "insensitive" } } },
    //       { categories: { some: { category: { name: { contains: search, mode: "insensitive" } } } } },
    //       { tags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } } },
    //       { owner: { fullName: { contains: search, mode: "insensitive" } } },
    //     ],
    //   };
    // }
    // return prisma.enrollment.findMany({
    //   where: { userId, ...(whereCourse && { course: whereCourse }) },
    //   select: {
    //     course: { include: { metaApproved: true } },
    //     _count: {
    //       select: {
    //         lessonProgress: { where: { status: "COMPLETED" } },
    //       },
    //     },
    //   },
    // });
    const searchFilter = search
      ? Prisma.sql`
      AND (
        ma.payload ->> 'title' ILIKE ${"%" + search + "%"}
        OR EXISTS (
          SELECT 1
          FROM "course_categories" cc
          JOIN "categories" cat
            ON cat.id = cc."categoryId"
          WHERE cc."courseId" = c.id
            AND cat.name ILIKE ${"%" + search + "%"}
        )
        OR EXISTS (
          SELECT 1
          FROM "course_tags" ct
          JOIN "tags" t
            ON t.id = ct."tagId"
          WHERE ct."courseId" = c.id
            AND t.name ILIKE ${"%" + search + "%"}
        )
        OR EXISTS (
          SELECT 1
          FROM "users" u
          WHERE u.id = c."ownerId"
            AND u."fullName" ILIKE ${"%" + search + "%"}
        )
      )
    `
      : Prisma.empty;
    const count = await prisma.enrollment.count({ where: { userId } });
    const result = await prisma.$queryRaw`
      SELECT
        e.id AS "enrollmentId",
        c.id AS "courseId",
        c.slug AS "slug",
        MAX(ma.payload ->> 'title') AS "title",
        MAX(ma.payload ->> 'coverImage') AS "coverImage",
        COUNT(lp.id)::int AS total,
        COUNT(CASE WHEN lp.status = 'COMPLETED' THEN 1 END)::int AS completed
      FROM enrollments e
      JOIN "courses" c
        ON c.id = e."courseId"
      LEFT JOIN "course_meta_approved" ma
        ON ma."courseId" = c.id
      LEFT JOIN "lesson_progress" lp
        ON lp."enrollmentId" = e.id
      WHERE
        e."userId" = ${userId}
      ${searchFilter}
      GROUP BY e.id, c.id, c.slug
      ORDER BY e."createdAt" DESC
      LIMIT ${take}
      OFFSET ${skip}
      `;
    return { count, result };
  },
};
