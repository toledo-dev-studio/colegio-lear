import { Router } from "express";
import multer from "multer";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  teacherTaskParentParamsSchema,
  teacherTaskIdParamsSchema,
  teacherTaskAttachmentIdParamsSchema,
  upsertSchoolSubjectTaskSchema,
} from "./school-subject-task.schema";
import {
  findAll,
  createOrUpdate,
  remove,
  addAttachment,
  removeAttachment,
} from "./school-subject-task-teacher.controller";

/**
 * Teacher-facing tasks routes, mounted in index.ts's protected section (any
 * valid employee session, never `authorize(moduleKey)` — see
 * teacher-class-scope.helper.ts for the real authorization: the teacher must
 * actually teach this subject in this class).
 */
const router = Router();

const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const uploadAttachmentSingle = uploadAttachment.single("file");

/**
 * @openapi
 * /me/school-groups/{schoolGroupId}/subjects/{schoolSubjectId}/tasks:
 *   get:
 *     tags:
 *       - My Classes
 *     summary: List all tasks for a subject taught by the authenticated teacher (no pagination)
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
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/SchoolSubjectTaskRecord' }
 *       401:
 *         description: No employee session
 *       404:
 *         description: Class/subject doesn't exist, or isn't taught by this teacher
 *   post:
 *     tags:
 *       - My Classes
 *     summary: Create or update a task (upsert)
 *     description: An absent `id` creates a new task; a real UUID updates the existing one.
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
 *             required: [title, dueDate]
 *             properties:
 *               id: { type: string, format: uuid }
 *               title: { type: string }
 *               description: { type: string }
 *               dueDate: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Task created or updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SchoolSubjectTaskRecord' }
 *       401:
 *         description: No employee session
 *       404:
 *         description: Class/subject doesn't exist, or isn't taught by this teacher
 */
router.get(
  "/:schoolGroupId/subjects/:schoolSubjectId/tasks",
  validate(teacherTaskParentParamsSchema, "params"),
  findAll,
);

router.post(
  "/:schoolGroupId/subjects/:schoolSubjectId/tasks",
  validate(teacherTaskParentParamsSchema, "params"),
  validate(upsertSchoolSubjectTaskSchema, "body"),
  createOrUpdate,
);

/**
 * @openapi
 * /me/school-groups/{schoolGroupId}/subjects/{schoolSubjectId}/tasks/{taskId}:
 *   delete:
 *     tags:
 *       - My Classes
 *     summary: Delete a task (and its attachments, in storage and the DB)
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
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: No employee session
 *       404:
 *         description: Task not found, or the class/subject isn't taught by this teacher
 */
router.delete(
  "/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId",
  validate(teacherTaskIdParamsSchema, "params"),
  remove,
);

/**
 * @openapi
 * /me/school-groups/{schoolGroupId}/subjects/{schoolSubjectId}/tasks/{taskId}/attachments:
 *   post:
 *     tags:
 *       - My Classes
 *     summary: Add an attachment to a task
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
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Attachment added — returns only the newly created attachment (not the full task)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SchoolSubjectTaskAttachmentRecord' }
 *       400:
 *         description: File is required
 *       401:
 *         description: No employee session
 *       404:
 *         description: Task not found, or the class/subject isn't taught by this teacher
 */
router.post(
  "/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments",
  validate(teacherTaskIdParamsSchema, "params"),
  uploadAttachmentSingle,
  addAttachment,
);

/**
 * @openapi
 * /me/school-groups/{schoolGroupId}/subjects/{schoolSubjectId}/tasks/{taskId}/attachments/{attachmentId}:
 *   delete:
 *     tags:
 *       - My Classes
 *     summary: Delete a task attachment (file in storage and the DB row)
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
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: No employee session
 *       404:
 *         description: Task/attachment not found, or the class/subject isn't taught by this teacher
 */
router.delete(
  "/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments/:attachmentId",
  validate(teacherTaskAttachmentIdParamsSchema, "params"),
  removeAttachment,
);

export default router;
