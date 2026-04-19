import { NOTIFICATION } from "../../config";

export const DOMAIN_EVENTS = Object.freeze({
  NEW_ADMIN_NOTIFICATIONS: "new_admin_notifications",
  NEW_USER_NOTIFICATIONS: "new_user_notifications",
});

export type DomainEventPayloadMap = {
  [DOMAIN_EVENTS.NEW_ADMIN_NOTIFICATIONS]: {
    type: (typeof NOTIFICATION.TYPES)[keyof typeof NOTIFICATION.TYPES];
    message: string;
    courseId?: number;
    requestedByUserId?: number;
    canceledByUserId?: number;
  };
  [DOMAIN_EVENTS.NEW_USER_NOTIFICATIONS]: {
    type: (typeof NOTIFICATION.TYPES)[keyof typeof NOTIFICATION.TYPES];
    toUserId: number;
    message: string;
    courseId?: number;
    requestedByUserId?: number;
    canceledByUserId?: number;
  };
};

export type DomainEventName = keyof DomainEventPayloadMap;
