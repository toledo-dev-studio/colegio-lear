import { Router } from "express";
import { authenticateStudent } from "../../shared/middleware/auth-student.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  chatParentParamsSchema,
  chatMessagesParamsSchema,
  chatMessagesPagedQuerySchema,
  sendChatMessageSchema,
} from "./chat.schema";
import { findAllChats, findMessages, sendMessage } from "./chat.controller";

/**
 * Chat routes. The conversation list (GET .../chats) is student-only —
 * authenticateStudent applied as regular chained middleware, no
 * gate-student-session fallthrough needed (this exact URL prefix has no
 * employee-side counterpart at all).
 *
 * The two message routes below serve BOTH a student and a teacher session
 * from the exact same URL and controller function — auth there is resolved
 * inside findMessages/sendMessage themselves via resolveChatActor (see
 * resolve-chat-actor.middleware.ts), not as chained middleware here.
 */
const router = Router();

/**
 * @openapi
 * /students/{studentId}/enrollments/{enrollmentId}/chats:
 *   get:
 *     tags:
 *       - Chats
 *     summary: List the authenticated student's conversations for an enrollment
 *     description: One conversation per teacher currently teaching the enrollment's group — derived from the class schedule, not a stored "chat" entity.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ChatRecord' }
 *       401:
 *         description: No student session
 *       404:
 *         description: studentId doesn't match the session, or the enrollment isn't the student's own
 */
router.get(
  "/:studentId/enrollments/:enrollmentId/chats",
  authenticateStudent,
  validate(chatParentParamsSchema, "params"),
  findAllChats,
);

/**
 * @openapi
 * /students/{studentId}/enrollments/{enrollmentId}/chats/{teacherId}/messages:
 *   get:
 *     tags:
 *       - Chats
 *     summary: List messages in a conversation (paginated, most recent first page)
 *     description: Ascending order within each page; pagination walks backward through history (page 1 = most recent).
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ChatMessageRecord' }
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 itemsCount: { type: integer }
 *       401:
 *         description: No student/teacher session
 *       404:
 *         description: With a student session, studentId/enrollment mismatch or teacherId doesn't teach this group; with a teacher session, teacherId doesn't match the session or the teacher doesn't teach this group
 *   post:
 *     tags:
 *       - Chats
 *     summary: Send a message (student to teacher, or teacher to student)
 *     description: With a student session, notifies the teacher's bell (GET /notifications/admin/{employeeId}). With a teacher session, notifies the student's bell (GET /notifications/student/{studentId}) and sentBy is "teacher".
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SendChatMessageBody' }
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ChatMessageRecord' }
 *       401:
 *         description: No student/teacher session
 *       404:
 *         description: With a student session, studentId/enrollment mismatch or teacherId doesn't teach this group; with a teacher session, teacherId doesn't match the session or the teacher doesn't teach this group
 */
router.get(
  "/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages",
  validate(chatMessagesParamsSchema, "params"),
  validate(chatMessagesPagedQuerySchema, "query"),
  findMessages,
);

router.post(
  "/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages",
  validate(chatMessagesParamsSchema, "params"),
  validate(sendChatMessageSchema, "body"),
  sendMessage,
);

export default router;
