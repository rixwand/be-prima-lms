export const NOTIFICATION = Object.freeze({
  TYPES: {
    ANNOUNCEMENT: "announcement",
    SYSTEM: "system",
    COURSE_SUBMISSION: "course_submission",
    COURSE_APPROVED: "course_approved",
    COURSE_REJECTED: "course_rejected",
    COURSE_SUBMISSION_CANCELED: "course_submission_canceled",
  },
} as const);

export type NotificationType = (typeof NOTIFICATION.TYPES)[keyof typeof NOTIFICATION.TYPES];
