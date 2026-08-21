import { Router } from "express";
import { getByIdStudent } from "./announcement-student.controller";

/**
 * Serves the same URL as the equivalent route in announcement.routes.ts
 * (mounted after this router in index.ts, under the employee
 * authenticate/authorize) but for a student session. Single handler — see
 * gate-student-session.middleware.ts for why splitting the gate check into
 * its own chained middleware would break the fallthrough to the employee
 * router.
 */
const router = Router();

/**
 * @openapi
 * /announcements/{id}:
 *   get:
 *     tags:
 *       - Announcements (Student)
 *     summary: Get an announcement the authenticated student was sent
 *     description: Student-portal version of GET /announcements/{id} — requires a student session (cookie access_token) and that a "student" notification pointing at this announcement exists for them. Falls through to the employee-authorized version of this same route when the session isn't a student's.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Announcement detail with attachments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnouncementDetail'
 *       401:
 *         description: No student session
 *       404:
 *         description: Announcement not found, or wasn't sent to this student
 */
router.get("/:id", getByIdStudent);

export default router;
