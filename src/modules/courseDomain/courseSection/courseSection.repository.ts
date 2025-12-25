import { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { ApiError } from "../../../common/utils/http";

type SectionRow = { id: number; position: number };

async function getSectionsForCourse<T extends Prisma.CourseSectionSelect>(
  courseId: number,
  select: T
): Promise<Array<Prisma.CourseSectionGetPayload<{ select: T }>>>;

async function getSectionsForCourse(courseId: number): Promise<Array<Prisma.CourseSectionGetPayload<{}>>>;

async function getSectionsForCourse<T extends Prisma.CourseSectionSelect>(
  courseId: number,
  select?: T
): Promise<Array<Prisma.CourseSectionGetPayload<{ select: T }> | Prisma.CourseSectionGetPayload<{}>>> {
  return prisma.courseSection.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
    select: { ...select },
  });
}

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

  async createOne(section: { title: string; position: number; courseId: number }) {
    return prisma.courseSection.create({
      data: section,
    });
  },

  async findByIdOrThrow(id: number) {
    const data = await prisma.courseSection.findUnique({ where: { id } });
    if (!data) throw new ApiError(404, "Course Section not found");
    return data;
  },

  async update({ title, sectionId, courseId }: { title: string; sectionId: number; courseId: number }) {
    return prisma.courseSection.update({
      where: { id: sectionId, courseId },
      data: { title },
    });
  },

  getSectionsForCourse,

  async getSectionsWithLessons(courseId: number) {
    return prisma.courseSection.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
      select: {
        id: true,
        courseId: true,
        title: true,
        position: true,
        course: {
          select: {
            title: true,
          },
        },
        lessons: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            sectionId: true,
            title: true,
            summary: true,
            position: true,
            slug: true,
            durationSec: true,
            isPreview: true,
          },
        },
      },
    });
  },

  async getCourseTitle(courseId: number) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });
    if (!course) throw new ApiError(404, "Course not found");
    return course.title;
  },

  async bulkApplyPositionsTwoPhase(courseId: number, items: SectionRow[]) {
    const VALUES = Prisma.join(items.map(it => Prisma.sql`(${it.id}, ${it.position})`));

    await prisma.$transaction(async tx => {
      // Phase 1: bump all current positions up beyond the max
      await tx.$executeRaw`
      UPDATE "course_sections"
      SET "position" = "position" + (
        SELECT MAX("position") + 1 FROM "course_sections" WHERE "courseId" = ${courseId}
      )
      WHERE "courseId" = ${courseId};
    `;

      // Phase 2: apply the final mapping
      await tx.$executeRaw`
      UPDATE "course_sections" AS cs
      SET "position" = v."position"
      FROM (VALUES ${VALUES}) AS v("id", "position")
      WHERE cs."id" = v."id" AND cs."courseId" = ${courseId};
    `;
    });
  },

  async remove(ids: { id: number; courseId: number }) {
    return prisma.courseSection.delete({ where: ids });
  },

  async removeMany({ courseId, ids }: { ids: number[]; courseId: number }) {
    return prisma.courseSection.deleteMany({
      where: {
        id: { in: ids },
        courseId,
      },
    });
  },
};
