import { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { buildStatusWhere, slugify } from "../../../common/utils/course";
import { OptionalizeUndefined, optionalizeUndefined } from "../../../common/utils/function";
import {
  ICourseCategoriesCreateEntity,
  ICourseCreateEntity,
  ICourseDiscountCreate,
  ICourseSectionsCreate,
  IListMyCourseParams,
  IListPublicCourseParams,
  IListPublicTagsParams,
} from "./course.types";

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
    categories: { ids, primaryId },
  }: {
    course: ICourseCreateEntity;
    tags: string[];
    categories: ICourseCategoriesCreateEntity;
    sections: ICourseSectionsCreate;
    discount?: OptionalizeUndefined<ICourseDiscountCreate>;
  }) {
    const data = optionalizeUndefined(course);
    console.log(discount);
    return prisma.$transaction(async tx => {
      const course = await tx.course.create({
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
      await tx.courseCategory.createMany({
        data: ids.map(c_id => ({
          categoryId: c_id,
          courseId: course.id,
          isPrimary: c_id == primaryId,
        })),
      });
    });
  },

  async update(course: Prisma.CourseUpdateWithoutTagsInput, id: number) {
    return prisma.course.update({
      where: { id },
      data: course,
    });
  },

  async updateCategories(courseId: number, { ids, primaryId }: ICourseCategoriesCreateEntity) {
    return prisma.$transaction(async tx => {
      await tx.courseCategory.deleteMany({
        where: { courseId },
      });

      await tx.courseCategory.createMany({
        data: ids.map(id => ({
          courseId,
          categoryId: id,
          isPrimary: id === primaryId,
        })),
      });
    });
  },

  async listPublicTags({ search, limit, page }: IListPublicTagsParams) {
    const where: Prisma.TagWhereInput = {
      courses: {
        some: {
          course: {
            publishedAt: { not: null },
            takenDownAt: null,
          },
        },
      },
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    };
    return Promise.all([
      prisma.tag.findMany({
        where,
        omit: {
          id: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          name: "asc",
        },
      }),
      prisma.tag.count({
        where,
      }),
    ]);
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

  async listPublicCourses({
    isFree,
    limit,
    page,
    search,
    tagSlugs,
    categories,
    primaryCategory,
  }: IListPublicCourseParams) {
    const where: Prisma.CourseWhereInput = {
      publishedAt: { not: null },
      takenDownAt: null,
      isFree,
      ...(search && { title: { contains: search, mode: "insensitive" } }),
      ...(tagSlugs &&
        tagSlugs.length > 0 && {
          tags: {
            some: {
              tag: {
                slug: { in: tagSlugs },
              },
            },
          },
        }),
      ...(primaryCategory && {
        categories: {
          some: {
            isPrimary: true,
            category: { slug: primaryCategory },
          },
        },
      }),

      ...(categories &&
        categories.length > 0 && {
          categories: {
            some: {
              isPrimary: false,
              category: { slug: { in: categories } },
            },
          },
        }),
    };
    return Promise.all([
      prisma.course.findMany({
        where,
        include: {
          owner: {
            select: {
              fullName: true,
              username: true,
              profilePict: true,
            },
          },
          discount: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count({
        where,
      }),
    ]);
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

  async listCourseByUser({
    userId,
    params: { page, limit, endDate, search, startDate, status },
  }: {
    userId: number;
    params: IListMyCourseParams;
  }) {
    const statusWhere = buildStatusWhere(status);
    const filter: Prisma.CourseWhereInput = {
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
      ...(search && { title: { contains: search, mode: "insensitive" } }),
      ...statusWhere,
    };
    return Promise.all([
      prisma.course.findMany({
        where: {
          ownerId: userId,
          ...filter,
        },
        include: {
          discount: true,
          coursePublishRequest: {
            select: { status: true },
          },
        },
        omit: { descriptionJson: true, shortDescription: true, ownerId: true, previewVideo: true },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.course.count({ where: { ownerId: userId, ...filter } }),
    ]);
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
