import { Router } from "express";
import { findAllPaged } from "./school-subject-task-student.controller";

/**
 * Student-portal route for SERVICIOS_PORTAL_ALUMNO.md §9.1. Serves the same
 * URL as the equivalent employee route in academic-cycle.routes.ts (mounted
 * after this one in index.ts, under authorize("my-classes")) — single
 * handler, see gate-student-session.middleware.ts for why chaining more
 * middleware here would break the fallthrough to the employee router.
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
  findAllPaged,
);

export default router;
