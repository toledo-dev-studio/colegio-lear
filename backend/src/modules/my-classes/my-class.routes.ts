import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { myClassPagedQuerySchema, myClassIdParamSchema } from "./my-class.schema";
import { findAllPaged, findById } from "./my-class.controller";

/**
 * Teacher-facing "my classes" routes. Mounted in index.ts's protected
 * section (after the global `authenticate`, like notification.routes.ts) —
 * any valid employee session reaches these handlers, but never
 * `authorize(moduleKey)`: a teacher's security role has no canWrite/canDelete
 * on "academic-cycles" and only canRead, so RBAC isn't the right
 * authorization model here. Instead, ownership is "is this teacher assigned
 * to this class", resolved from AcademicCycleGroupCalendar.teacherId inside
 * MyClassService — 404 (not 403) when the class isn't theirs, same posture
 * as the rest of this codebase.
 */
const router = Router();

/**
 * @openapi
 * /me/school-groups/paged:
 *   get:
 *     tags:
 *       - My Classes
 *     summary: List the authenticated teacher's classes (paginated)
 *     description: A "class" is an academic cycle school group the teacher is assigned to teach at least one subject in (resolved via the group's calendar), not a direct relation on the group itself.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string, maxLength: 100 }
 *       - in: query
 *         name: name
 *         schema: { type: string, maxLength: 100 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, discharged] }
 *       - in: query
 *         name: academicCycleStatus
 *         schema: { type: string, enum: [upcoming, active, completed, cancelled, archived] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/MyClassRecord' }
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 itemsCount: { type: integer }
 *       401:
 *         description: No employee session
 */
router.get(
  "/paged",
  validate(myClassPagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /me/school-groups/{id}:
 *   get:
 *     tags:
 *       - My Classes
 *     summary: Get one of the authenticated teacher's classes by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Class detail
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MyClassRecord' }
 *       401:
 *         description: No employee session
 *       404:
 *         description: The class doesn't exist, or the teacher isn't assigned to it
 */
router.get("/:id", validate(myClassIdParamSchema, "params"), findById);

export default router;
