import { $Enums } from "@prisma/client";
import * as yup from "yup";

const INVOICE_STATUSES = Object.values($Enums.InvoiceStatus) as readonly $Enums.InvoiceStatus[];

const transformEmptyToUndefined = (value: unknown, originalValue: unknown) =>
  originalValue === "" ? undefined : value;

export const listInvoiceParamsValidation = yup
  .object({
    page: yup.number().transform(transformEmptyToUndefined).integer().positive().default(1).optional(),
    limit: yup.number().transform(transformEmptyToUndefined).integer().positive().max(100).default(10).optional(),
    search: yup.string().trim().min(3).max(255).optional(),
    status: yup
      .mixed<$Enums.InvoiceStatus>()
      .transform(transformEmptyToUndefined)
      .oneOf(INVOICE_STATUSES)
      .optional(),
    startDate: yup.date().transform(transformEmptyToUndefined).optional(),
    endDate: yup
      .date()
      .transform(transformEmptyToUndefined)
      .min(yup.ref("startDate"), "endDate must be greater than or equal to startDate")
      .optional(),
  })
  .required()
  .noUnknown();
