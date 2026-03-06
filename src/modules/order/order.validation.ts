import { $Enums } from "@prisma/client";
import * as yup from "yup";

const ORDER_STATUSES = Object.values($Enums.OrderStatus) as readonly $Enums.OrderStatus[];
const transformEmptyToUndefined = (value: unknown, originalValue: unknown) =>
  originalValue === "" ? undefined : value;

export const createOrderSchema = yup
  .object({
    courseId: yup.number().integer().positive().required(),
    code: yup.string().max(20).min(3).optional(),
  })
  .required()
  .noUnknown();

export const listOrderParamsValidation = yup
  .object({
    page: yup.number().transform(transformEmptyToUndefined).integer().positive().default(1).optional(),
    limit: yup.number().transform(transformEmptyToUndefined).integer().positive().max(100).default(10).optional(),
    search: yup.string().trim().min(3).max(255).optional(),
    status: yup
      .mixed<$Enums.OrderStatus>()
      .transform(transformEmptyToUndefined)
      .oneOf(ORDER_STATUSES)
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
