import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import { auditQuerySchema } from "./audit.schema";
import * as controller from "./audit.controller";

const router = Router();

/**
 * @openapi
 * /api/audit-logs:
 *   get:
 *     tags:
 *       - Audit
 *     summary: List audit logs
 *     description: Returns a paginated list of audit logs with optional filters. Requires "audit:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: integer
 *         description: Filter by employee ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type (e.g. "create", "update", "delete")
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filter by resource name (e.g. "employees", "profiles")
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date (inclusive)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs up to this date (inclusive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 100)
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 */
router.get(
  "/api/audit-logs",
  authenticate,
  authorize("audit", "read"),
  validate(auditQuerySchema, "query"),
  controller.getAll,
);

export default router;
