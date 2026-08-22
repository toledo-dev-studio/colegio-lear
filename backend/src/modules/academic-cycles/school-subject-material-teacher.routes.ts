import { Router } from "express";
import multer from "multer";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  teacherMaterialParentParamsSchema,
  teacherMaterialIdParamsSchema,
} from "./school-subject-material.schema";
import { findAll, create, remove } from "./school-subject-material-teacher.controller";

/**
 * Teacher-facing materials routes, mounted in index.ts's protected section
 * (any valid employee session, never `authorize(moduleKey)` — see
 * teacher-class-scope.helper.ts).
 */
const router = Router();

const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const uploadAttachmentSingle = uploadAttachment.single("file");

/**
 * @openapi
 * /me/school-groups/{schoolGroupId}/subjects/{schoolSubjectId}/materials:
 *   get:
 *     tags:
 *       - My Classes
 *     summary: List all materials for a subject taught by the authenticated teacher
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
 *         description: List of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/SchoolSubjectMaterialFlatRecord' }
 *       401:
 *         description: No employee session
 *       404:
 *         description: Class/subject doesn't exist, or isn't taught by this teacher
 *   post:
 *     tags:
 *       - My Classes
 *     summary: Upload a new material (one attachment per material)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Material created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SchoolSubjectMaterialFlatRecord' }
 *       400:
 *         description: File is required
 *       401:
 *         description: No employee session
 *       404:
 *         description: Class/subject doesn't exist, or isn't taught by this teacher
 */
router.get(
  "/:schoolGroupId/subjects/:schoolSubjectId/materials",
  validate(teacherMaterialParentParamsSchema, "params"),
  findAll,
);

router.post(
  "/:schoolGroupId/subjects/:schoolSubjectId/materials",
  validate(teacherMaterialParentParamsSchema, "params"),
  uploadAttachmentSingle,
  create,
);

/**
 * @openapi
 * /me/school-groups/{schoolGroupId}/subjects/{schoolSubjectId}/materials/{materialId}:
 *   delete:
 *     tags:
 *       - My Classes
 *     summary: Delete a material (file in storage and the DB row)
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
 *         name: materialId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: No employee session
 *       404:
 *         description: Material not found, or the class/subject isn't taught by this teacher
 */
router.delete(
  "/:schoolGroupId/subjects/:schoolSubjectId/materials/:materialId",
  validate(teacherMaterialIdParamsSchema, "params"),
  remove,
);

export default router;
