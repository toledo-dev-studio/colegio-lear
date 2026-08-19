import { Router } from "express";
import { authenticateStudent } from "../../shared/middleware/auth-student.middleware";
import { findAll } from "./school-subject-material-student.controller";

/**
 * Student-portal route for SERVICIOS_PORTAL_ALUMNO.md §9.2. No employee-side
 * URL collision, so authenticateStudent is applied as regular chained
 * middleware, same pattern as /students/me.
 */
const router = Router();

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/school-subjects/{academicCycleSchoolSubjectId}/materials:
 *   get:
 *     tags:
 *       - School Subject Materials (Student)
 *     summary: List materials for a school subject in the authenticated student's own group
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
 *     responses:
 *       200:
 *         description: List of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/SchoolSubjectMaterialRecord' }
 *       401:
 *         description: No student session
 *       404:
 *         description: Group not found, or doesn't belong to the student's own enrollments
 */
router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/materials",
  authenticateStudent,
  findAll,
);

export default router;
