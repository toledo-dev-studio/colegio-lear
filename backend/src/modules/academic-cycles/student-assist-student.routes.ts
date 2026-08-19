import { Router } from "express";
import { findAllPaged } from "./student-assist-student.controller";

/**
 * Serves the same URL as the equivalent route in academic-cycle.routes.ts
 * (mounted after this router in index.ts, under the employee
 * authenticate/authorize) but for a student session. Single handler — see
 * gate-student-session.middleware.ts for why splitting the gate check into
 * its own chained middleware would break the fallthrough to the employee
 * router.
 */
const router = Router();

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/assists:
 *   get:
 *     tags:
 *       - Student Assists (Student)
 *     summary: List the authenticated student's own attendance records for an enrollment
 *     description: Student-portal version of GET .../assists — requires a student session (cookie access_token) and that the enrollment belongs to the student. Falls through to the employee-authorized version of this same route when the session isn't a student's. No implicit default date range is applied when fromDate/toDate are omitted.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: fromDate
 *         schema: { type: string, format: date }
 *         description: Inclusive lower bound (ISO or YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema: { type: string, format: date }
 *         description: Inclusive upper bound (ISO or YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Paginated list of attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/StudentAssistRecord' }
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 itemsCount: { type: integer }
 *       401:
 *         description: No student session
 *       404:
 *         description: Enrollment not found, or doesn't belong to the student
 */
router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists",
  findAllPaged,
);

export default router;
