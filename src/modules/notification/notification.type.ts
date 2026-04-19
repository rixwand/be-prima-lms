import { NotificationType } from "../../config";

export interface ListNotificationParams {
  page?: number | undefined;
  limit?: number | undefined;
  isRead?: boolean | undefined;
  type?: NotificationType | undefined;
}

export interface ListNotificationRepositoryParams {
  userId: number;
  skip: number;
  take: number;
  isRead?: boolean | undefined;
  type?: NotificationType | undefined;
}

export interface CreateNotification {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  metadata?: object;
}
