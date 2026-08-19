import { z } from "zod";

/** Validates path params for the chats list endpoint */
export const chatParentParamsSchema = z.object({
  studentId: z.string().uuid({ message: "studentId must be a valid UUID" }),
  enrollmentId: z.string().uuid({ message: "enrollmentId must be a valid UUID" }),
});

/** Validates path params for a single conversation's messages */
export const chatMessagesParamsSchema = chatParentParamsSchema.extend({
  teacherId: z.string().uuid({ message: "teacherId must be a valid UUID" }),
});

/** Validates GET messages query: page (default 1), pageSize (default 20, matches CHAT_PAGE_SIZE) */
export const chatMessagesPagedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

/** Validates POST body for sending a chat message */
export const sendChatMessageSchema = z.object({
  content: z.string().min(1, "content is required").max(2000),
});
