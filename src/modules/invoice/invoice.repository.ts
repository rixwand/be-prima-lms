import { $Enums, Prisma } from "@prisma/client";
import { PrismaTx, prisma } from "../../common/libs/prisma";
import { ListInvoiceRepositoryParams } from "./invoice.types";
type INV = {
  amount: number;
  status: $Enums.InvoiceStatus;
  orderId: string;
  expiresAt?: Date;
  paidAt?: string;
  xenditId?: string;
};

const listInvoiceSelect = {
  id: true,
  invoiceNumber: true,
  status: true,
  createdAt: true,
  amount: true,
  order: {
    select: {
      id: true,
      course: { select: { metaApproved: { select: { payload: true } } } },
      amount: true,
      status: true,
      createdAt: true,
    },
  },
} satisfies Prisma.InvoiceSelect;

export default {
  async create(data: INV, tx?: Prisma.TransactionClient) {
    if (tx) return createInvoiceFn(tx, data);
    else {
      return prisma.$transaction(async tx => createInvoiceFn(tx, data), { timeout: 30000 });
    }
  },

  async update(id: string, data: Prisma.InvoiceUpdateInput, db: PrismaTx = prisma) {
    return db.invoice.update({ where: { id }, data });
  },

  async paid(invoiceNumber: string, db: PrismaTx = prisma) {
    return db.invoice.update({
      where: { invoiceNumber },
      data: { status: "PAID", paidAt: new Date() },
    });
  },

  async failed(invoiceNumber: string, db: PrismaTx = prisma) {
    return db.invoice.update({ where: { invoiceNumber }, data: { status: "FAILED" } });
  },

  async getByInvoiceNumber(invoiceNumber: string) {
    return prisma.invoice.findUnique({ where: { invoiceNumber }, include: { order: true } });
  },

  async listByUser(userId: number, params: ListInvoiceRepositoryParams, db: PrismaTx = prisma) {
    const where = buildInvoiceParamsWhere(params);
    const count = await db.invoice.count({ where });
    const invoices = await db.invoice.findMany({
      where: {
        order: { userId },
        ...where,
      },
      select: listInvoiceSelect,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
    return { count, invoices };
  },

  async listAll(params: ListInvoiceRepositoryParams, db: PrismaTx = prisma) {
    const where = buildInvoiceParamsWhere(params);
    const count = await db.invoice.count({ where });
    const invoices = await db.invoice.findMany({
      where,
      select: listInvoiceSelect,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
    return { count, invoices };
  },
};

const createInvoiceFn = async (tx: Prisma.TransactionClient, data: INV) => {
  const year = new Date().getFullYear();
  const counter = await tx.invoiceCounter.upsert({
    where: { year },
    update: {
      seq: { increment: 1 },
    },
    create: { year, seq: 1 },
  });
  const formattedNumber = `INV-${year}-${counter.seq.toString().padStart(6, "0")}`;
  return tx.invoice.create({
    data: {
      invoiceNumber: formattedNumber,
      ...data,
    },
  });
};

const buildInvoiceParamsWhere = (params: ListInvoiceRepositoryParams) =>
  ({
    ...(params.search && {
      OR: [
        { invoiceNumber: { contains: params.search, mode: "insensitive" } },
        { xenditId: { contains: params.search, mode: "insensitive" } },
        { orderId: { contains: params.search, mode: "insensitive" } },
      ],
    }),
    ...(params.status && { status: params.status as $Enums.InvoiceStatus }),
    ...((params.startDate || params.endDate) && {
      createdAt: {
        ...(params.startDate && { gte: params.startDate }),
        ...(params.endDate && { lte: params.endDate }),
      },
    }),
  }) satisfies Prisma.InvoiceWhereInput;
