import invoiceRepository from "./invoice.repository";
import { ListInvoiceParams } from "./invoice.types";

export default {
  async listAll(params: ListInvoiceParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    const { count, invoices } = await invoiceRepository.listAll({
      search: params.search,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      invoices,
      meta: {
        total: count,
        page,
        limit,
        totalPage: Math.ceil(count / limit),
      },
    };
  },
  async listByUser(userId: number, params: ListInvoiceParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    const { count, invoices } = await invoiceRepository.listByUser(userId, {
      search: params.search,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      invoices,
      meta: {
        total: count,
        page,
        limit,
        totalPage: Math.ceil(count / limit),
      },
    };
  },
};
