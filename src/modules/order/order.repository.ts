import { $Enums, Prisma } from "@prisma/client";
import { PrismaTx, prisma } from "../../common/libs/prisma";
import { ListOrderRepositoryParams } from "./order.types";

export default {
  async create(data: { userId: number; courseId: number; amount: number }, db: PrismaTx = prisma) {
    return db.order.create({
      data,
    });
  },

  async get(id: string, db: PrismaTx = prisma) {
    return db.order.findUnique({ where: { id } });
  },

  async update(id: string, data: { status?: $Enums.OrderStatus }, db: PrismaTx = prisma) {
    return db.order.update({
      where: { id },
      data,
    });
  },

  async list(params: ListOrderRepositoryParams, db: PrismaTx = prisma) {
    const where: Prisma.OrderWhereInput = {
      ...(params.status && { status: params.status as $Enums.OrderStatus }),
      ...((params.startDate || params.endDate) && {
        createdAt: {
          ...(params.startDate && { gte: params.startDate }),
          ...(params.endDate && { lte: params.endDate }),
        },
      }),
      ...(params.search && {
        OR: [
          { id: { contains: params.search, mode: "insensitive" } },
          {
            course: {
              metaApproved: {
                payload: {
                  path: ["title"],
                  string_contains: params.search,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }),
    };

    const count = await db.order.count({ where });
    const orders = await db.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            slug: true,
            metaApproved: {
              select: {
                payload: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });

    return { count, orders };
  },
};
