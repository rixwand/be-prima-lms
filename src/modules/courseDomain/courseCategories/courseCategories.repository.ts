import { Prisma } from "@prisma/client";
import { prisma } from "../../../common/libs/prisma";
import { slugify } from "../../../common/utils/course";
import {
  CourseCategory,
  CourseCategoryCreateManyPayload,
  CourseCategoryCreatePayload,
  CourseCategoryListParams,
  CourseCategoryUpdatePayload,
} from "./courseCategories.types";

type IncludeArg<I extends Prisma.CategoryInclude> = {
  include: I;
  select?: never;
};
type SelectArg<S extends Prisma.CategorySelect> = { select: S; include?: never };

async function findById(id: number): Promise<Prisma.CategoryGetPayload<{}> | null>;

async function findById<I extends Prisma.CategoryInclude>(
  id: number,
  opts: IncludeArg<I>
): Promise<Prisma.CategoryGetPayload<{ include: I }> | null>;

async function findById<S extends Prisma.CategorySelect>(
  id: number,
  opts: SelectArg<S>
): Promise<Prisma.CategoryGetPayload<{ select: S }> | null>;

async function findById(id: number, opts?: any) {
  if (opts && opts.select)
    return prisma.category.findUnique({
      where: { id },
      select: opts.select,
    });
  if (opts && opts.include)
    return prisma.category.findUnique({
      where: { id },
      include: opts.include,
    });
  else
    return prisma.category.findUnique({
      where: { id },
    });
}

async function findBySlug(slug: string): Promise<Prisma.CategoryGetPayload<{}> | null>;

async function findBySlug<I extends Prisma.CategoryInclude>(
  slug: string,
  opts: IncludeArg<I>
): Promise<Prisma.CategoryGetPayload<{ include: I }> | null>;

async function findBySlug<S extends Prisma.CategorySelect>(
  slug: string,
  opts: SelectArg<S>
): Promise<Prisma.CategoryGetPayload<{ select: S }> | null>;

async function findBySlug(slug: string, opts?: any) {
  if (opts && opts.select)
    return prisma.category.findUnique({
      where: { slug },
      select: opts.select,
    });
  if (opts && opts.include)
    return prisma.category.findUnique({
      where: { slug },
      include: opts.include,
    });
  else
    return prisma.category.findUnique({
      where: { slug },
    });
}

export const courseCategoryRepo = {
  async create(data: CourseCategoryCreatePayload) {
    return prisma.category.create({
      data: {
        name: data.category,
        slug: slugify(data.category),
      },
    });
  },

  async createMany({ categories }: CourseCategoryCreateManyPayload) {
    return prisma.category.createMany({
      data: categories.map(name => ({
        name,
        slug: slugify(name),
      })),
    });
  },

  findById: findById,
  findBySlug: findBySlug,

  async update(id: number, { name, slug }: CourseCategoryUpdatePayload) {
    return await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
      },
    });
  },

  async delete(id: number): Promise<CourseCategory> {
    return prisma.category.delete({
      where: { id },
    });
  },

  async list({ limit, page, search }: CourseCategoryListParams): Promise<CourseCategory[]> {
    return prisma.category.findMany({
      ...(search && { where: { name: { contains: search, mode: "insensitive" } } }),
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
      },
    });
  },

  async deleteMany(ids: number[]) {
    return prisma.category.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  },

  async count(): Promise<number> {
    return prisma.category.count();
  },
};
