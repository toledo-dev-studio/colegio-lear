import type { EmployeeRecord } from "../employees/employee.types";

export type ChatMessageSenderKey = "student" | "teacher";

/**
 * One conversation entry — derived from the group's calendar (see
 * ChatService.findAllChats), not its own stored entity. A "chat" is the
 * pair (enrollment, teacher).
 */
export interface ChatRecord {
  enrollmentId: string;
  teacherId: string;
  teacher: EmployeeRecord;
  schoolSubject: { id: string; name: string; description: string | null };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

/** Record returned from the student_chat_messages table */
export interface ChatMessageRecord {
  id: string;
  chatId: string; // = teacherId, per the doc's contract
  sentBy: ChatMessageSenderKey;
  content: string;
  sentAt: string;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
