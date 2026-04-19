import * as yup from "yup";
import { NOTIFICATION, NotificationType } from "../../config";

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

const notificationTypes = Object.values(NOTIFICATION.TYPES) as NotificationType[];

export const listNotificationParamsValidation = yup
  .object({
    page: yup.number().transform(transformEmptyToUndefined).integer().positive().default(1).optional(),
    limit: yup.number().transform(transformEmptyToUndefined).integer().positive().max(100).default(10).optional(),
    isRead: yup.boolean().transform(transformBoolean).optional(),
    type: yup.mixed<NotificationType>().transform(transformEmptyToUndefined).oneOf(notificationTypes).optional(),
  })
  .required()
  .noUnknown();
