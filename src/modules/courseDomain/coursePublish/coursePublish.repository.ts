import { Prisma, PublishRequestStatus } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { GetCoursePublishRequestQueries, ICreateCoursePublishRequest } from "./coursePublish.types";

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
      const [published, pending] = await Promise.all([
        prisma.coursePublishRequest.findMany({
          where: { status: PublishRequestStatus.APPROVED },
          include: {
            course: {
              include: {
                owner: true,
              },
            },
            reviewedBy: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.coursePublishRequest.findMany({
          where: { status: PublishRequestStatus.PENDING },
          include: {
            course: {
              include: {
                owner: true,
              },
            },
            reviewedBy: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);
      return { published, pending };
    }

    const where: Prisma.CoursePublishRequestWhereInput = {
      ...(status && { status }),
      // createdAt: {
      //   gte: startDate,
      //   lte: endDate,
      // },
    };

    if (search) {
      where.OR = [
        { course: { title: { contains: search, mode: "insensitive" } } },
        { course: { owner: { fullName: { contains: search, mode: "insensitive" } } } },
      ];
    }
    return prisma.coursePublishRequest.findMany({
      where,
      include: {
        course: {
          include: {
            owner: true,
          },
        },
        reviewedBy: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
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
