import { Course, CourseMetaApproved, Prisma } from "@prisma/client";
import { PrismaTx, prisma } from "../../../common/libs/prisma";
import { buildStatusWhere, comingSoonLesson, slugify } from "../../../common/utils/course";
import { OptionalizeUndefined, optionalizeUndefined } from "../../../common/utils/function";
import { ApiError } from "../../../common/utils/http";
import {
  ICourseCategoriesCreateEntity,
  ICourseCreateEntity,
  ICourseDiscountCreate,
  ICourseSectionsCreate,
  IListMyCourseParams,
  IListPublicCourseParams,
  IListPublicTagsParams,
  MetaApprovedPayload,
} from "./course.types";

type IncludeArg<I extends Prisma.CourseInclude> = { include: I; select?: never };
type SelectArg<S extends Prisma.CourseSelect> = { select: S; include?: never };

async function findById(id: number): Promise<Prisma.CourseGetPayload<{}> | null>;
async function findById<I extends Prisma.CourseInclude>(
  id: number,
  opts: IncludeArg<I>,
): Promise<Prisma.CourseGetPayload<{ include: I }> | null>;

async function findById<S extends Prisma.CourseSelect>(
  id: number,
  opts: SelectArg<S>,
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

type TierB = Partial<Omit<MetaApprovedPayload, "isFree" | "priceAmount">>;
type TierC = Partial<Pick<MetaApprovedPayload, "isFree" | "priceAmount">> &
  Partial<Pick<Prisma.CourseUpdateInput, "categories" | "discounts" | "tags">>;
type ApplyMetaDraftParams =
  | { courseId: number; tier: "B"; data: TierB; db?: PrismaTx }
  | { courseId: number; tier: "C"; data: TierC; db?: PrismaTx };
type UpdateApprovedReturn = CourseMetaApproved;
type UpdateCourseReturn = Course;
async function applyMetaDraft(params: {
  courseId: number;
  tier: "B";
  data: TierB;
  db?: PrismaTx;
}): Promise<UpdateApprovedReturn>;

async function applyMetaDraft(params: {
  courseId: number;
  tier: "C";
  data: TierC;
  db?: PrismaTx;
}): Promise<UpdateCourseReturn>;

async function applyMetaDraft({ courseId, data, tier, db = prisma }: ApplyMetaDraftParams) {
  const approved = await db.courseMetaApproved.findUnique({ where: { courseId } });
  if (!approved) throw new ApiError(404, "Course Not found or not publised yet");
  if (!approved.payload || typeof approved.payload !== "object" || Array.isArray(approved.payload)) {
    throw new ApiError(400, "Invalid approved meta payload");
  }
  const approvedPayload = approved.payload as MetaApprovedPayload;
  if (tier == "B") {
    return db.courseMetaApproved.update({
      where: { courseId },
      data: {
        payload: {
          ...approvedPayload,
          ...data,
        },
      },
    });
  }
  const { categories, discounts, tags, ...draftPayload } = data;
  if (Object.keys(draftPayload).length > 0) {
    await db.courseMetaApproved.update({
      where: { courseId },
      data: {
        payload: {
          ...approvedPayload,
          ...draftPayload,
        },
      },
    });
  }

  return db.course.update({
    where: {
      id: courseId,
    },
    data: {
      ...(categories && { categories }),
      ...(discounts && { discounts }),
      ...(tags && { tags }),
    },
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
    const { ownerId, slug, ...data } = optionalizeUndefined(course);
    return prisma.$transaction(
      async tx => {
        const course = await tx.course.create({
          data: {
            ownerId,
            slug,
            metaDraft: {
              create: {
                ...data,
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
                draftDiscounts: {
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
                              create: lessons.map(({ durationSec, summary, contentJson, ...lesson }, li) => ({
                                ...lesson,
                                contentLive: comingSoonLesson,
                                contentDraft: contentJson,
                                slug: slugify(lesson.title),
                                position: li + 1,
                              })),
                            }
                          : {}),
                      },
                    })),
                  },
                }
              : {}),
          },
          select: { metaDraft: { select: { id: true } } },
        });
        await tx.courseDraftCategory.createMany({
          data: ids.map(c_id => ({
            categoryId: c_id,
            draftId: course.metaDraft?.id!,
            isPrimary: c_id == primaryId,
          })),
        });
      },
      { timeout: 30000 },
    );
  },

  async updateDraftCategories(draftId: number, { ids, primaryId }: ICourseCategoriesCreateEntity) {
    return prisma.$transaction(
      async tx => {
        const { count: removed } = await tx.courseDraftCategory.deleteMany({
          where: { draftId },
        });

        const { count: created } = await tx.courseDraftCategory.createMany({
          data: ids.map(id => ({
            draftId,
            categoryId: id,
            isPrimary: id === primaryId,
          })),
        });
        return { removed, created };
      },
      { timeout: 30000 },
    );
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

  findById,

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
      metaApproved: {
        AND: [
          search
            ? {
                payload: {
                  path: ["title"],
                  string_contains: search,
                  mode: "insensitive",
                },
              }
            : {},
          isFree
            ? {
                payload: {
                  path: ["isFree"],
                  equals: isFree,
                },
              }
            : {},
        ],
      },
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
          metaApproved: { select: { payload: true } },
          owner: {
            select: {
              fullName: true,
              username: true,
              profilePict: true,
            },
          },
          discounts: true,
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
      where: { id, publishedAt: null, takenDownAt: null },
      include: { metaDraft: true },
    });
  },

  async removeMany(ids: number[]) {
    return prisma.course.deleteMany({
      where: {
        id: { in: ids },
        publishedAt: null,
        takenDownAt: null,
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
      ...statusWhere,
      metaDraft: {
        ...(search && {
          OR: [
            {
              title: { contains: search, mode: "insensitive" },
            },
            {
              draftTags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } },
            },
            {
              draftCategories: { some: { category: { name: { contains: search, mode: "insensitive" } } } },
            },
          ],
        }),
      },
    };
    return Promise.all([
      prisma.course.findMany({
        where: {
          ownerId: userId,
          ...filter,
        },
        include: {
          publishRequest: {
            select: { status: true, id: true, notes: true, type: true },
          },
          metaDraft: {
            include: {
              draftDiscounts: true,
              draftCategories: { select: { category: true } },
              draftTags: { select: { tag: true } },
            },
          },
          metaApproved: true,
        },
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
        metaApproved: { select: { payload: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
        categories: { select: { category: { select: { name: true, slug: true } } } },
        sections: {
          where: { publishedAt: { not: null } },
          select: {
            title: true,
            lessons: { where: { publishedAt: { not: null } }, select: { title: true }, orderBy: { position: "asc" } },
          },
          orderBy: { position: "asc" },
        },
        discounts: true,
      },
    });
  },

  async findEnrollmentBySlug(slug: string) {
    return prisma.course.findUnique({
      where: { slug },
      select: { id: true, enrollments: { select: { userId: true, id: true } } },
    });
  },

  async publishCourse({ id, db = prisma }: { id: number; db?: PrismaTx }) {
    const draft = await db.course.findUnique({
      where: { id },
      select: {
        metaDraft: {
          omit: { courseId: true, createdAt: true, id: true, updatedAt: true },
          include: { draftCategories: true, draftDiscounts: true, draftTags: true },
        },
      },
    });
    const { draftCategories, draftDiscounts, draftTags, ...payload } = draft?.metaDraft!;

    await db.course.update({
      where: { id },
      data: {
        metaApproved: { create: { payload, approvedAt: new Date() } },
        publishedAt: new Date(),
        categories: { create: draftCategories.map(({ draftId, ...dc }) => ({ ...dc })) },
        tags: { create: draftTags.map(({ tagId }) => ({ tagId })) },
        discounts: { create: draftDiscounts.map(({ draftId, ...dd }) => ({ ...dd })) },
      },
    });

    await db.courseMetaDraft.update({
      where: { courseId: id },
      data: { requiresApproval: [] },
    });
    return { courseTitle: draft?.metaDraft?.title! };
  },

  async cleanConnection(courseId: number, db: PrismaTx = prisma) {
    return Promise.all([
      db.courseCategory.deleteMany({ where: { courseId } }),
      db.courseTag.deleteMany({ where: { courseId } }),
      db.courseDiscount.deleteMany({ where: { courseId } }),
    ]);
  },

  applyMetaDraft,
  async getApprovedMeta(courseId: number) {
    const draftMeta = await prisma.courseMetaApproved.findUnique({ where: { courseId } });
    return draftMeta?.payload;
  },
  async getApprovedDiscount(courseId: number) {
    return prisma.courseDiscount.findMany({ where: { courseId } });
  },
  async getApprovedCategories(courseId: number) {
    return prisma.courseCategory.findMany({ where: { courseId }, omit: { courseId: true } });
  },
  async getApprovedTags(courseId: number) {
    return prisma.courseTag.findMany({ where: { courseId }, select: { tagId: true } });
  },
};
