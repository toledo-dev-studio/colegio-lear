import { Router } from "express";
import { authorize } from "../../shared/middleware/rbac.middleware";
import {
  getAcademicCyclesSummary,
  getFinancialSummary,
  getAnnouncementsSummary,
  getSystemSummary,
  getLatestTeachers,
} from "./dashboard.controller";

const router = Router();

/**
 * @openapi
 * /dashboard/academic-cycles:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Academic cycles / students summary
 *     description: Returns active academic cycle count, active/dropped student counts, and the top 3 active-cycle school groups by average grade. If there are no active academic cycles, everything besides the count is zero/empty.
 *     responses:
 *       200:
 *         description: Academic cycles summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleSummaryRecord'
 */
router.get(
  "/academic-cycles",
  authorize("dashboard"),
  getAcademicCyclesSummary,
);

/**
 * @openapi
 * /dashboard/financial:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Financial (student wallet) summary
 *     description: Returns paid/pending/forgiven payment totals, scoped to active academic cycles only. All zero if there are no active academic cycles.
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialSummaryRecord'
 */
router.get("/financial", authorize("dashboard"), getFinancialSummary);

/**
 * @openapi
 * /dashboard/announcements:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Announcements ("campaigns") summary
 *     description: Returns the count of announcements currently within their publish/expiry window, and the aggregate viewed percentage (derived from the cron-maintained recipientsCount/viewedCount fields on Announcement).
 *     responses:
 *       200:
 *         description: Announcements summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnouncementSummaryRecord'
 */
router.get(
  "/announcements",
  authorize("dashboard"),
  getAnnouncementsSummary,
);

/**
 * @openapi
 * /dashboard/system:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: System-wide registration counts
 *     description: Returns counts of security roles, job titles, and employees split by teacher/administrative job title type.
 *     responses:
 *       200:
 *         description: System summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemSummaryRecord'
 */
router.get("/system", authorize("dashboard"), getSystemSummary);

/**
 * @openapi
 * /dashboard/teacher-employees:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Most recently registered teacher employees
 *     description: Returns up to 10 teacher-type employees, most recently created first.
 *     responses:
 *       200:
 *         description: List of the latest registered teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeacherEmployeeSummaryRecord'
 */
router.get(
  "/teacher-employees",
  authorize("dashboard"),
  getLatestTeachers,
);

export default router;
