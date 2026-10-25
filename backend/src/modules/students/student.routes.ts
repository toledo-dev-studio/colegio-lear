import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import {
  idParamSchema,
  studentIdParamSchema,
  studentSubResourceParamSchema,
  studentFiltersSchema,
  studentPagedQuerySchema,
  createStudentSchema,
  updateStudentSchema,
} from "./student.schema";
import {
  createStudentGuardianSchema,
  updateStudentGuardianSchema,
} from "./student-guardian.schema";
import {
  createAllergySchema,
  updateAllergySchema,
} from "./student-allergy.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
  sendCredentials,
} from "./student.controller";
import {
  findAllGuardians,
  createGuardian,
  updateGuardian,
  deleteGuardian,
} from "./student-guardian.controller";
import {
  findAllAllergies,
  createAllergy,
  updateAllergy,
  deleteAllergy,
} from "./student-allergy.controller";
import { findAllForStudent as findAllEnrollmentsForStudent } from "../academic-cycles/academic-cycle-enrollment.controller";

const router = Router();

// ─── Students CRUD ───────────────────────────────────────────────────────────

/**
 * @openapi
 * /students:
 *   get:
 *     tags:
 *       - Students
 *     summary: List all students
 *     description: Returns all students with optional filters (q, fullName, curp, enrollment, email, phoneNumber, isActive).
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name, lastNames, email, curp, enrollment
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Filter by name or last names (case-insensitive)
 *       - in: query
 *         name: curp
 *         schema:
 *           type: string
 *           maxLength: 18
 *         description: Filter by CURP (case-insensitive contains)
 *       - in: query
 *         name: enrollment
 *         schema:
 *           type: string
 *           maxLength: 20
 *         description: Filter by enrollment (case-insensitive contains)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           maxLength: 150
 *         description: Filter by email (case-insensitive contains)
 *       - in: query
 *         name: phoneNumber
 *         schema:
 *           type: string
 *           maxLength: 20
 *         description: Filter by phone number (case-insensitive contains)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active/inactive status
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentRecord'
 *       400:
 *         description: Validation error
 */
router.get(
  "/",
  authorize("students"),
  validate(studentFiltersSchema, "query"),
  findAll,
);

/**
 * @openapi
 * /students/paged:
 *   get:
 *     tags:
 *       - Students
 *     summary: List students with pagination
 *     description: Returns a paginated list of students with optional filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Free-text search
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Filter by name
 *       - in: query
 *         name: curp
 *         schema:
 *           type: string
 *         description: Filter by CURP
 *       - in: query
 *         name: enrollment
 *         schema:
 *           type: string
 *         description: Filter by enrollment
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *       - in: query
 *         name: phoneNumber
 *         schema:
 *           type: string
 *         description: Filter by phone number
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentRecord'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 itemsCount:
 *                   type: integer
 *       400:
 *         description: Validation error
 */
// Also read by the academic-cycles enrollments tab's student picker, so
// either module grants access.
router.get(
  "/paged",
  authorize(["students", "academic-cycles"]),
  validate(studentPagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     tags:
 *       - Students
 *     summary: Get a student by ID
 *     description: Returns a single student by UUID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student UUID
 *     responses:
 *       200:
 *         description: Student found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentRecord'
 *       404:
 *         description: Student not found
 */
router.get(
  "/:id",
  authorize("students"),
  validate(idParamSchema, "params"),
  findById,
);

/**
 * @openapi
 * /students:
 *   post:
 *     tags:
 *       - Students
 *     summary: Create a new student
 *     description: Creates a new student. Enrollment is auto-generated. Validates CURP and email uniqueness.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentBody'
 *     responses:
 *       201:
 *         description: Student created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentRecord'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate CURP or email
 */
router.post(
  "/",
  authorize("students"),
  validate(createStudentSchema, "body"),
  create,
);

/**
 * @openapi
 * /students/{id}:
 *   patch:
 *     tags:
 *       - Students
 *     summary: Update a student
 *     description: Partially updates a student. At least one field must be provided.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentBody'
 *     responses:
 *       200:
 *         description: Student updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentRecord'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Student not found
 *       409:
 *         description: Duplicate CURP or email
 */
router.patch(
  "/:id",
  authorize("students"),
  validate(idParamSchema, "params"),
  validate(updateStudentSchema, "body"),
  update,
);

/**
 * @openapi
 * /students/{id}:
 *   delete:
 *     tags:
 *       - Students
 *     summary: Soft delete a student
 *     description: Sets the student as deleted (logical deletion).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Student not found
 *       409:
 *         description: Already deleted
 */
router.delete(
  "/:id",
  authorize("students"),
  validate(idParamSchema, "params"),
  softDelete,
);

// ─── Send Credentials ────────────────────────────────────────────────────────

/**
 * @openapi
 * /students/{id}/send-credentials:
 *   post:
 *     tags:
 *       - Students
 *     summary: Send credentials to principal guardians
 *     description: Generates a new temporary password and sends it via email to all guardians marked as isPrincipal for the given student.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student UUID
 *     responses:
 *       200:
 *         description: Credentials sent successfully
 *       404:
 *         description: Student not found
 *       409:
 *         description: No principal guardians found
 */
router.post(
  "/:id/send-credentials",
  authorize("students"),
  validate(idParamSchema, "params"),
  sendCredentials,
);

// ─── Student Guardians ───────────────────────────────────────────────────────

/**
 * @openapi
 * /students/{studentId}/guardians:
 *   get:
 *     tags:
 *       - Student Guardians
 *     summary: List guardians for a student
 *     description: Returns all guardians associated with the given student.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of guardians
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentGuardianRecord'
 *       404:
 *         description: Student not found
 */
router.get(
  "/:studentId/guardians",
  authorize("students"),
  validate(studentIdParamSchema, "params"),
  findAllGuardians,
);

/**
 * @openapi
 * /students/{studentId}/guardians:
 *   post:
 *     tags:
 *       - Student Guardians
 *     summary: Create a guardian for a student
 *     description: Creates a new guardian. If isPrincipal is true, any existing principal is unset.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentGuardianBody'
 *     responses:
 *       201:
 *         description: Guardian created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentGuardianRecord'
 *       404:
 *         description: Student not found
 */
router.post(
  "/:studentId/guardians",
  authorize("students"),
  validate(studentIdParamSchema, "params"),
  validate(createStudentGuardianSchema, "body"),
  createGuardian,
);

/**
 * @openapi
 * /students/{studentId}/guardians/{id}:
 *   patch:
 *     tags:
 *       - Student Guardians
 *     summary: Update a guardian
 *     description: Partially updates a guardian. If isPrincipal is set to true, others are unset.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentGuardianBody'
 *     responses:
 *       200:
 *         description: Guardian updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentGuardianRecord'
 *       404:
 *         description: Student or guardian not found
 */
router.patch(
  "/:studentId/guardians/:id",
  authorize("students"),
  validate(studentSubResourceParamSchema, "params"),
  validate(updateStudentGuardianSchema, "body"),
  updateGuardian,
);

/**
 * @openapi
 * /students/{studentId}/guardians/{id}:
 *   delete:
 *     tags:
 *       - Student Guardians
 *     summary: Delete a guardian
 *     description: Permanently removes a guardian from the student.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Student or guardian not found
 */
router.delete(
  "/:studentId/guardians/:id",
  authorize("students"),
  validate(studentSubResourceParamSchema, "params"),
  deleteGuardian,
);

// ─── Student Allergies ────────────────────────────────────────────────────────
// NOTE: bloodType/medicalNotes live directly on the student record (see
// StudentRecord). Allergies are their own sub-resource, one record at a
// time (no bulk array sync) — same shape as guardians above.

/**
 * @openapi
 * /students/{studentId}/allergies:
 *   get:
 *     tags:
 *       - Student Allergies
 *     summary: List allergies for a student
 *     description: Returns all allergies associated with the given student.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of allergies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AllergyRecord'
 *       404:
 *         description: Student not found
 */
router.get(
  "/:studentId/allergies",
  authorize("students"),
  validate(studentIdParamSchema, "params"),
  findAllAllergies,
);

/**
 * @openapi
 * /students/{studentId}/allergies:
 *   post:
 *     tags:
 *       - Student Allergies
 *     summary: Create an allergy for a student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAllergyBody'
 *     responses:
 *       201:
 *         description: Allergy created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllergyRecord'
 *       404:
 *         description: Student not found
 */
router.post(
  "/:studentId/allergies",
  authorize("students"),
  validate(studentIdParamSchema, "params"),
  validate(createAllergySchema, "body"),
  createAllergy,
);

/**
 * @openapi
 * /students/{studentId}/allergies/{id}:
 *   patch:
 *     tags:
 *       - Student Allergies
 *     summary: Update an allergy
 *     description: Partially updates an allergy. At least one field must be provided.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAllergyBody'
 *     responses:
 *       200:
 *         description: Allergy updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllergyRecord'
 *       404:
 *         description: Student or allergy not found
 */
router.patch(
  "/:studentId/allergies/:id",
  authorize("students"),
  validate(studentSubResourceParamSchema, "params"),
  validate(updateAllergySchema, "body"),
  updateAllergy,
);

/**
 * @openapi
 * /students/{studentId}/allergies/{id}:
 *   delete:
 *     tags:
 *       - Student Allergies
 *     summary: Delete an allergy
 *     description: Permanently removes an allergy from the student.
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Student or allergy not found
 */
router.delete(
  "/:studentId/allergies/:id",
  authorize("students"),
  validate(studentSubResourceParamSchema, "params"),
  deleteAllergy,
);

// ─── Student Academic Cycle Enrollments (read-only, cross academic cycles) ──

/**
 * @openapi
 * /students/{studentId}/enrollments:
 *   get:
 *     tags:
 *       - Students
 *     summary: List a student's enrollments across all academic cycles
 *     description: Returns every academic cycle enrollment for the student (owned by the academic-cycles domain).
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicCycleEnrollmentRecord'
 *       404:
 *         description: Student not found
 */
router.get(
  "/:studentId/enrollments",
  authorize("students"),
  validate(studentIdParamSchema, "params"),
  findAllEnrollmentsForStudent,
);

export default router;
