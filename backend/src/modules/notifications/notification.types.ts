export type NotificationTypeKey = "info" | "error" | "announcement" | "message";

/**
 * Which audience/app a notification belongs to. "admin" covers both admin
 * and teacher employees (this app); "student" is reserved for the
 * not-yet-built student-facing app — accepted at the route level but not
 * wired to any real data yet (see NotificationService.findAllPaged).
 */
export type NotificationRecipientTypeKey = "admin" | "student";

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
