export type NotificationTypeKey = "info" | "error" | "announcement" | "message";

/** Row returned from the notifications table. */
export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: NotificationTypeKey;
  relatedRecordId: string;
  createdAt: string;
  read: boolean;
}

/** Result of a paginated query. */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
