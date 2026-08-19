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
 * Student-portal chat routes. This exact URL prefix
 * (/students/:studentId/enrollments/:enrollmentId/chats...) has no
 * employee-side counterpart, so — same as /students/me — authenticateStudent
 * is applied as regular chained middleware, no gate-student-session
 * fallthrough needed.
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
 *         description: No student session
 *       404:
 *         description: studentId/enrollment mismatch, or teacherId doesn't teach this group
 *   post:
 *     tags:
 *       - Chats
 *     summary: Send a message to a teacher
 *     description: Notifies the teacher via the existing employee notification bell (GET /notifications/admin/{employeeId}).
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
 *         description: No student session
 *       404:
 *         description: studentId/enrollment mismatch, or teacherId doesn't teach this group
 */
router.get(
  "/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages",
  authenticateStudent,
  validate(chatMessagesParamsSchema, "params"),
  validate(chatMessagesPagedQuerySchema, "query"),
  findMessages,
);

router.post(
  "/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages",
  authenticateStudent,
  validate(chatMessagesParamsSchema, "params"),
  validate(sendChatMessageSchema, "body"),
  sendMessage,
);

export default router;
