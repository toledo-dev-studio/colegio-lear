import { Router } from "express";
import { authenticateStudent } from "../../shared/middleware/auth-student.middleware";
import { findAllPaged } from "./school-subject-task-student.controller";

/**
 * Student-portal route for SERVICIOS_PORTAL_ALUMNO.md §9.1. This exact URL
 * has no employee-side counterpart, so unlike the calendars/grades/wallet
 * student routers, there's no fallthrough concern — authenticateStudent is
 * applied as regular chained middleware, same pattern as /students/me.
 */
const router = Router();

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/school-subjects/{academicCycleSchoolSubjectId}/tasks:
 *   get:
 *     tags:
 *       - School Subject Tasks (Student)
 *     summary: List tasks for a school subject in the authenticated student's own group (paginated)
 *     description: Requires a student session and that the group belongs to one of the student's own enrollments.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 5 }
 *     responses:
 *       200:
 *         description: Paginated list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SchoolSubjectTaskRecord' }
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 itemsCount: { type: integer }
 *       401:
 *         description: No student session
 *       404:
 *         description: Group not found, or doesn't belong to the student's own enrollments
 */
router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks",
  authenticateStudent,
  findAllPaged,
);

export default router;
