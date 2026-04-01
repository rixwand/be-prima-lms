export interface ListNotificationParams {
  page?: number | undefined;
  limit?: number | undefined;
  isRead?: boolean | undefined;
  type?: string | undefined;
}

export interface ListNotificationRepositoryParams {
  userId: number;
  skip: number;
  take: number;
  isRead?: boolean | undefined;
  type?: string | undefined;
}
