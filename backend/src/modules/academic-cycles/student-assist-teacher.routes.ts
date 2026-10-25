import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  teacherAssistGroupParamsSchema,
  teacherAssistDayQuerySchema,
  upsertGroupAssistsSchema,
} from "./student-assist.schema";
import { findAllByGroupAndDay, upsertMany } from "./student-assist-teacher.controller";

/**
 * Teacher-facing group attendance routes, mounted in index.ts's protected
 * section (any valid employee session, never `authorize(moduleKey)` — see
 * teacher-class-scope.helper.ts). Attendance is per-day for the whole group,
 * not per-subject, so any teacher with a calendar slot in the group (any
 * subject) can view/take it — resolveTeacherGroupScope, not
 * resolveTeacherSubjectScope.
 */
const router = Router();

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{schoolGroupId}/assists:
 *   get:
 *     tags:
 *       - My Classes
 *     summary: List a group's attendance for a single day
 *     description: Filters strictly by day (YYYY-MM-DD), not timestamp.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: schoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: assistDate
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of attendance records for that day
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/StudentAssistRecord' }
 *       401:
 *         description: No employee session
 *       404:
 *         description: Class doesn't exist, or isn't taught by this teacher
 *   post:
 *     tags:
 *       - My Classes
 *     summary: Create or update a group's attendance for a single day (bulk upsert)
 *     description: Upsert per enrollment/day — creates a record if none exists yet, updates it otherwise. All enrollments must belong to this group.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: schoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assistDate, assists]
 *             properties:
 *               assistDate: { type: string, format: date }
 *               assists:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [academicCycleEnrollmentId, status]
 *                   properties:
 *                     academicCycleEnrollmentId: { type: string, format: uuid }
 *                     status: { type: string, enum: [present, absent] }
 *                     absenceReason: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: The day's resulting attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/StudentAssistRecord' }
 *       401:
 *         description: No employee session
 *       404:
 *         description: Class doesn't exist, isn't taught by this teacher, or an enrollment isn't in this class
 */
router.get(
  "/:academicCycleId/school-groups/:schoolGroupId/assists",
  validate(teacherAssistGroupParamsSchema, "params"),
  validate(teacherAssistDayQuerySchema, "query"),
  findAllByGroupAndDay,
);

router.post(
  "/:academicCycleId/school-groups/:schoolGroupId/assists",
  validate(teacherAssistGroupParamsSchema, "params"),
  validate(upsertGroupAssistsSchema, "body"),
  upsertMany,
);

export default router;
