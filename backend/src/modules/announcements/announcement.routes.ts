import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  idParamSchema,
  announcementFiltersSchema,
  announcementPagedQuerySchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "./announcement.schema";
import {
  getAll,
  getAllPaged,
  getById,
  create,
  update,
  remove,
} from "./announcement.controller";

const router = Router();

/**
 * @openapi
 * /announcements:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: List all announcements
 *     description: Returns all announcements matching the optional query filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name and description (case-insensitive)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Filter by name (case-insensitive contains)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active/inactive status
 *       - in: query
 *         name: publishedAt
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by publication date (ISO date string, day-based)
 *       - in: query
 *         name: expiresAt
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by expiration date (ISO date string, day-based)
 *     responses:
 *       200:
 *         description: List of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Announcements retrieved
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 */
router.get("/", validate(announcementFiltersSchema, "query"), getAll);

/**
 * @openapi
 * /announcements/paged:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: List announcements with pagination
 *     description: Returns a paginated list of announcements matching the optional query filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name and description (case-insensitive)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Filter by name (case-insensitive contains)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active/inactive status
 *       - in: query
 *         name: publishedAt
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by publication date (ISO date string, day-based)
 *       - in: query
 *         name: expiresAt
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by expiration date (ISO date string, day-based)
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
 *         description: Paginated list of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid pagination parameters
 */
router.get(
  "/paged",
  validate(announcementPagedQuerySchema, "query"),
  getAllPaged,
);

/**
 * @openapi
 * /announcements:
 *   post:
 *     tags:
 *       - Announcements
 *     summary: Create a new announcement
 *     description: Creates a new announcement with the provided data. Status defaults to true.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementDto'
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Announcement created
 *                 data:
 *                   $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Validation error
 */
router.post("/", validate(createAnnouncementSchema, "body"), create);

/**
 * @openapi
 * /announcements/{id}:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: Get announcement by ID
 *     description: Returns a single announcement by its UUID, including its attachments.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Announcement UUID
 *     responses:
 *       200:
 *         description: Announcement detail with attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AnnouncementDetail'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Announcement not found
 */
router.get("/:id", validate(idParamSchema, "params"), getById);

/**
 * @openapi
 * /announcements/{id}:
 *   patch:
 *     tags:
 *       - Announcements
 *     summary: Update an announcement
 *     description: Partially updates an existing announcement. At least one field must be provided.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Announcement UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAnnouncementDto'
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Announcement not found
 */
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateAnnouncementSchema, "body"),
  update,
);

/**
 * @openapi
 * /announcements/{id}:
 *   delete:
 *     tags:
 *       - Announcements
 *     summary: Soft delete an announcement
 *     description: Sets the announcement status to false (logical deletion). Does not remove the record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Announcement UUID
 *     responses:
 *       200:
 *         description: Announcement deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Comunicado desactivado correctamente
 *                 data:
 *                   type: "null"
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Announcement not found
 *       409:
 *         description: Announcement is already inactive
 */
router.delete("/:id", validate(idParamSchema, "params"), remove);

export default router;
