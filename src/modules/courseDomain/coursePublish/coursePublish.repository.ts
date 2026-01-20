import { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { optionalizeUndefined } from "../../../common/utils/function";
import {
  GetCoursePublishRequestQueries,
  ICreateCoursePublishRequest,
  IUpdateStatusCoursePublishRequest,
} from "./coursePublish.types";

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
    return prisma.$transaction(async tx => {
      const newReq = await tx.coursePublishRequest.create({
        data: {
          course: { connect: { id: courseId } },
          notes: data.notes || null,
        },
      });
      await tx.course.update({
        where: { id: courseId },
        data: {
          publishedAt: new Date(),
        },
      });
      return newReq;
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

  async updateStatus({
    courseId,
    data,
    id,
  }: {
    id: number;
    courseId: number;
    data: IUpdateStatusCoursePublishRequest;
  }) {
    return prisma.$transaction(async tx => {
      const updated = await tx.coursePublishRequest.update({
        where: { id },
        data: optionalizeUndefined(data),
      });
      const course = await tx.course.update({
        where: {
          id: courseId,
        },
        data: {
          ...(data.status == "APPROVED" && { publishedAt: new Date() }),
        },
        select: {
          title: true,
        },
      });
      return {
        ...updated,
        courseTitle: course.title,
      };
    });
  },
  async deleteRequest(courseId: number) {
    const { course } = await prisma.coursePublishRequest.delete({
      where: { courseId },
      select: { course: { select: { title: true } } },
    });
    return { ...course };
  },
  async cancelResubmittedRequest(courseId: number) {
    const recent = await prisma.coursePublishRequest.findUnique({ where: { courseId }, select: { notes: true } });
    const {
      course: { title },
    } = await prisma.coursePublishRequest.update({
      where: { courseId },
      data: {
        status: "REJECTED",
        notes: `${recent?.notes}\n\n[instructor]:/CANCELED/`,
      },
      select: {
        course: { select: { title: true } },
      },
    });
    return { title };
  },
};
