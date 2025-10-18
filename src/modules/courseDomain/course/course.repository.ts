import type { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { slugify } from "../../../common/utils/course";
import { OptionalizeUndefined, optionalizeUndefined } from "../../../common/utils/function";
import { ICourseCreateEntity, ICourseDiscountCreate, ICourseSectionsCreate } from "./course.types";

type IncludeArg<I extends Prisma.CourseInclude> = { include: I; select?: never };
type SelectArg<S extends Prisma.CourseSelect> = { select: S; include?: never };

async function findById(id: number): Promise<Prisma.CourseGetPayload<{}> | null>;
async function findById<I extends Prisma.CourseInclude>(
  id: number,
  opts: IncludeArg<I>
): Promise<Prisma.CourseGetPayload<{ include: I }> | null>;

async function findById<S extends Prisma.CourseSelect>(
  id: number,
  opts: SelectArg<S>
): Promise<Prisma.CourseGetPayload<{ select: S }> | null>;

// Implementation (note the union type matches the overload shapes)
async function findById(id: number, opts?: any) {
  if (opts && opts.select)
    return prisma.course.findUnique({
      where: { id },
      select: opts.select,
    });
  if (opts && opts.include)
    return prisma.course.findUnique({
      where: { id },
      include: opts.include,
    });
  else
    return prisma.course.findUnique({
      where: { id },
    });
}

export const courseRepo = {
  async create({
    course,
    sections,
    tags,
    discount,
  }: {
    course: ICourseCreateEntity;
    tags: string[];
    sections: ICourseSectionsCreate;
    discount?: OptionalizeUndefined<ICourseDiscountCreate>;
  }) {
    const data = optionalizeUndefined(course);
    console.log(discount);
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
        ...(sections
          ? {
              sections: {
                create: sections.map(({ title, lessons }, i) => ({
                  title: title,
                  position: i + 1,
                  lessons: {
                    ...(lessons
                      ? {
                          create: lessons.map((l, li) => {
                            const lesson = optionalizeUndefined(l);
                            return {
                              ...lesson,
                              position: li + 1,
                              slug: slugify(l.title),
                            };
                          }),
                        }
                      : {}),
                  },
                })),
              },
            }
          : {}),
        discount: {
          ...(discount
            ? {
                create: {
                  ...discount,
                  type: discount.type == "FIXED" ? "FIXED" : "PERCENTAGE",
                },
              }
            : {}),
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

  findById,

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

  async remove(id: number) {
    return prisma.course.delete({
      where: { id },
    });
  },

  async removeMany(ids: number[]) {
    return prisma.course.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  },

  async listCourseByUser({ limit, page, userId }: { userId: number; page: number; limit: number }) {
    return prisma.course.findMany({
      where: { ownerId: userId },
      include: {
        discount: true,
      },
      omit: { descriptionJson: true, shortDescription: true, ownerId: true, previewVideo: true },
      take: limit,
      skip: (page - 1) * limit,
    });
  },

  async countAllByUser(userId: number) {
    return prisma.course.count({ where: { ownerId: userId } });
  },

  async findBySlug(slug: string) {
    return prisma.course.findUnique({
      where: { slug },
      include: {
        tags: { select: { tag: { select: { name: true } } } },
        sections: {
          select: { title: true, lessons: { select: { title: true }, orderBy: { position: "asc" } } },
          orderBy: { position: "asc" },
        },
        discount: true,
      },
    });
  },
};
