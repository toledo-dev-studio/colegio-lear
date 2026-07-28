import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  employeeIdParamSchema,
  idParamSchema,
  notificationPagedQuerySchema,
} from "./notification.schema";
import { findAllPaged, markAsRead } from "./notification.controller";

const router = Router();

/**
 * @openapi
 * /notifications/employees/{employeeId}:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: List an employee's notifications (paginated)
 *     description: Returns the authenticated employee's own notifications, most recent first. The employeeId path param must match the authenticated session — requesting another employee's notifications returns 403.
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
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
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 itemsCount:
 *                   type: integer
 *       403:
 *         description: Requesting another employee's notifications
 */
router.get(
  "/employees/:employeeId",
  validate(employeeIdParamSchema, "params"),
  validate(notificationPagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /notifications/{id}/read:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Mark a notification as read
 *     description: Idempotent — marking an already-read notification again is a no-op. Throws 403 if the notification doesn't belong to the authenticated employee. If the notification is of type "announcement", also increments the related announcement's viewedCount.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: "null"
 *       403:
 *         description: This notification does not belong to the authenticated employee
 *       404:
 *         description: Notification not found
 */
router.post("/:id/read", validate(idParamSchema, "params"), markAsRead);

export default router;
