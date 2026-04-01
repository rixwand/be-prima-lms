import * as yup from "yup";

const transformEmptyToUndefined = (value: unknown, originalValue: unknown) =>
  originalValue === "" ? undefined : value;

const transformBoolean = (value: unknown, originalValue: unknown) => {
  if (originalValue === "" || originalValue == null) return undefined;
  if (typeof originalValue === "string") {
    const normalized = originalValue.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return value;
};

export const listNotificationParamsValidation = yup
  .object({
    page: yup.number().transform(transformEmptyToUndefined).integer().positive().default(1).optional(),
    limit: yup.number().transform(transformEmptyToUndefined).integer().positive().max(100).default(10).optional(),
    isRead: yup.boolean().transform(transformBoolean).optional(),
    type: yup.string().trim().min(1).max(100).optional(),
  })
  .required()
  .noUnknown();
