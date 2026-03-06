export interface ListInvoiceParams {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: string | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}

export interface ListInvoiceRepositoryParams {
  skip: number;
  take: number;
  search?: string | undefined;
  status?: string | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}
