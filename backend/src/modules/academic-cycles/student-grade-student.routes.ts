import { Router } from "express";
import { findAllGrades } from "./student-grade-student.controller";

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
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/grades:
 *   get:
 *     tags:
 *       - Student Grades (Student)
 *     summary: List the authenticated student's own grades for an enrollment
 *     description: Student-portal version of GET .../grades — requires a student session (cookie access_token) and that the enrollment belongs to the student. Falls through to the employee-authorized version of this same route when the session isn't a student's.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of grades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/StudentGradeRecord' }
 *       401:
 *         description: No student session
 *       404:
 *         description: Enrollment not found, or doesn't belong to the student
 */
router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades",
  findAllGrades,
);

export default router;
