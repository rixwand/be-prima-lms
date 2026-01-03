import { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { GetCoursePublishRequestQueries, ICreateCoursePublishRequest } from "./coursePublish.types";

const selectCoursePublishReturn = {
  // select: {
  id: true,
  status: true,
  createdAt: true,
  courseId: true,
  course: {
    select: {
      title: true,
      coverImage: true,
      slug: true,
      priceAmount: true,
      isFree: true,
      discount: true,
      owner: {
        select: { fullName: true, username: true, profilePict: true },
      },
      // TODO: return for students and rating
    },
  },
  // },
} satisfies Prisma.CoursePublishRequestFindManyArgs["select"];

export const coursePublishRepository = {
  async create(data: ICreateCoursePublishRequest, courseId: number) {
    return prisma.coursePublishRequest.create({
      data: {
        course: { connect: { id: courseId } },
        notes: data.notes || null,
      },
    });
  },

  async findById(id: number) {
    return prisma.coursePublishRequest.findUnique({
      where: { id },
    });
  },

  async findByCourseId(courseId: number) {
    return prisma.coursePublishRequest.findUnique({
      where: { courseId },
    });
  },

  async listRequest(queries: GetCoursePublishRequestQueries) {
    const { page = 1, limit = 10, status, startDate, endDate, search } = queries;

    const areFiltersApplied = status || startDate || endDate || search;

    if (!areFiltersApplied) {
      return Promise.all([
        prisma.coursePublishRequest.count(),
        prisma.coursePublishRequest.findMany({
          select: selectCoursePublishReturn,
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);
    }

    const where: Prisma.CoursePublishRequestWhereInput = {
      ...(status && { status }),
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    };

    if (search) {
      where.OR = [
        { course: { title: { contains: search, mode: "insensitive" } } },
        { course: { owner: { fullName: { contains: search, mode: "insensitive" } } } },
      ];
    }
    return Promise.all([
      prisma.coursePublishRequest.count({
        where,
      }),
      prisma.coursePublishRequest.findMany({
        where,
        select: selectCoursePublishReturn,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
  },

  async update(id: number, data: Prisma.CoursePublishRequestUpdateInput) {
    return prisma.coursePublishRequest.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.coursePublishRequest.delete({
      where: { id },
    });
  },
};
