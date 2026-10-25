import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  teacherGradeParentParamsSchema,
  teacherGradeIdParamsSchema,
  upsertStudentGradeSchema,
} from "./student-grade.schema";
import { findAll, upsert, remove } from "./student-grade-teacher.controller";

/**
 * Teacher-facing grades routes, mounted in index.ts's protected section (any
 * valid employee session, never `authorize(moduleKey)` — see
 * teacher-class-scope.helper.ts).
 */
const router = Router();

/**
 * @openapi
 * /me/school-groups/{schoolGroupId}/subjects/{schoolSubjectId}/grades:
 *   get:
 *     tags:
 *       - My Classes
 *     summary: List every student's grades for a subject taught by the authenticated teacher
 *     description: One row per (enrollment, evaluation) pair — every enrollment in the group, not just the ones already graded.
 *     parameters:
 *       - in: path
 *         name: schoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: schoolSubjectId
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
 *         description: No employee session
 *       404:
 *         description: Class/subject doesn't exist, or isn't taught by this teacher
 *   put:
 *     tags:
 *       - My Classes
 *     summary: Create or update a student's grade for an evaluation (upsert)
 *     description: Idempotent — keyed on (academicCycleEnrollmentId, evaluationNumber) for this subject. The frontend never knows a grade's id when saving.
 *     parameters:
 *       - in: path
 *         name: schoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: schoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [academicCycleEnrollmentId, evaluationNumber, grade]
 *             properties:
 *               academicCycleEnrollmentId: { type: string, format: uuid }
 *               evaluationNumber: { type: integer, example: 1 }
 *               grade: { type: number, example: 7.8 }
 *     responses:
 *       200:
 *         description: Grade created or updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudentGradeRecord' }
 *       401:
 *         description: No employee session
 *       404:
 *         description: Class/subject doesn't exist, isn't taught by this teacher, or the enrollment isn't in this class
 */
router.get(
  "/:schoolGroupId/subjects/:schoolSubjectId/grades",
  validate(teacherGradeParentParamsSchema, "params"),
  findAll,
);

router.put(
  "/:schoolGroupId/subjects/:schoolSubjectId/grades",
  validate(teacherGradeParentParamsSchema, "params"),
  validate(upsertStudentGradeSchema, "body"),
  upsert,
);

/**
 * @openapi
 * /me/school-groups/{schoolGroupId}/subjects/{schoolSubjectId}/grades/{gradeId}:
 *   delete:
 *     tags:
 *       - My Classes
 *     summary: Delete a student's grade
 *     parameters:
 *       - in: path
 *         name: schoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: schoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: No employee session
 *       404:
 *         description: Grade not found, or the class/subject isn't taught by this teacher
 */
router.delete(
  "/:schoolGroupId/subjects/:schoolSubjectId/grades/:gradeId",
  validate(teacherGradeIdParamsSchema, "params"),
  remove,
);

export default router;
