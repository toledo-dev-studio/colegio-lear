import { Router } from "express";
import { authenticateStudent } from "../../shared/middleware/auth-student.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  studentIdParamSchema,
  notificationPagedQuerySchema,
  markAsReadStudentBodySchema,
} from "./notification.schema";
import { findAllPagedStudent, markAsReadStudent } from "./notification.controller";

/**
 * Student-portal notification routes. /notifications/student/:studentId has
 * no employee-side counterpart at this exact literal path ("student" is a
 * fixed segment here, not the :type param of the employee's
 * /notifications/:type/:id) — same as /students/me, authenticateStudent is
 * applied as regular chained middleware, no gate-student-session fallthrough
 * needed.
 */
const router = Router();

/**
 * @openapi
 * /notifications/student/{studentId}:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: List the authenticated student's notifications (paginated)
 *     description: Returns the authenticated student's own notifications, most recent first. The studentId path param must match the session — requesting another student's notifications returns 403.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificationRecord'
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 itemsCount: { type: integer }
 *       401:
 *         description: No student session
 *       403:
 *         description: Requesting another student's notifications
 */
router.get(
  "/student/:studentId",
  authenticateStudent,
  validate(studentIdParamSchema, "params"),
  validate(notificationPagedQuerySchema, "query"),
  findAllPagedStudent,
);

/**
 * @openapi
 * /notifications/student/{studentId}/read:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Mark a notification as read
 *     description: Idempotent — marking an already-read notification again is a no-op. Throws 403 if studentId doesn't match the session, 404 if the notification doesn't belong to the student. If the notification is of type "announcement", also increments the related announcement's viewedCount.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [notificationId]
 *             properties:
 *               notificationId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: "null"
 *       401:
 *         description: No student session
 *       403:
 *         description: studentId doesn't match the session
 *       404:
 *         description: Notification not found, or doesn't belong to the student
 */
router.post(
  "/student/:studentId/read",
  authenticateStudent,
  validate(studentIdParamSchema, "params"),
  validate(markAsReadStudentBodySchema, "body"),
  markAsReadStudent,
);

export default router;
