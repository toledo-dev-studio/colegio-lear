import { Router } from "express";
import {
  findAllCalendars,
  findAllTeachers,
} from "./academic-cycle-school-group-student.controller";

/**
 * Serves the same URLs as the equivalent routes in academic-cycle.routes.ts
 * (mounted after this router in index.ts, under the employee
 * authenticate/authorize) but for a student session. Each route here has
 * exactly ONE handler — see gate-student-session.middleware.ts for why
 * splitting the gate check into its own chained middleware would break the
 * fallthrough to the employee router.
 */
const router = Router();

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/calendars:
 *   get:
 *     tags:
 *       - Academic Cycle School Groups (Student)
 *     summary: List calendar entries for the authenticated student's own school group
 *     description: Student-portal version of GET .../calendars — requires a student session (cookie access_token) and that the group belongs to one of the student's own enrollments. Falls through to the employee-authorized version of this same route when the session isn't a student's.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of calendar entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/AcademicCycleSchoolGroupCalendarRecord' }
 *       401:
 *         description: No student session
 *       404:
 *         description: Group not found, or doesn't belong to the student's own enrollments
 */
router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/calendars",
  findAllCalendars,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/teachers:
 *   get:
 *     tags:
 *       - Academic Cycle School Groups (Student)
 *     summary: List teachers for the authenticated student's own school group
 *     description: Student-portal version of GET .../teachers — same access rules as .../calendars above. Always active teachers only (no includeInactive knob, that's admin-only).
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of distinct subject/teacher pairs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/AcademicCycleSchoolGroupTeacherRecord' }
 *       401:
 *         description: No student session
 *       404:
 *         description: Group not found, or doesn't belong to the student's own enrollments
 */
router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/teachers",
  findAllTeachers,
);

export default router;
