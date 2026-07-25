import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { globalSearchQuerySchema } from "./global-search.schema";
import { search } from "./global-search.controller";

const router = Router();

/**
 * @openapi
 * /global-search:
 *   get:
 *     tags:
 *       - Global Search
 *     summary: Search across every module the caller can read
 *     description: >
 *       Simple case-insensitive contains/ILIKE search reusing each module's own
 *       list-search fields (students, employees, academic-cycles, announcements,
 *       academic-levels, school-subjects, scholarships, payment-concepts,
 *       job-titles, security-roles). Runs one query per module in parallel,
 *       capped at 3 results each, and skips modules the caller lacks read
 *       permission for. Modules with zero matches are omitted from the response.
 *       No RBAC module check on the route itself — every authenticated user can
 *       call it, since per-module visibility is already enforced internally.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 5
 *           maxLength: 100
 *         description: Search term (minimum 5 characters, matches the frontend's own debounce gate)
 *     responses:
 *       200:
 *         description: Search results grouped by module (empty-result modules omitted)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GlobalSearchGroup'
 *       400:
 *         description: Validation error (q missing or too short)
 *       401:
 *         description: Not authenticated
 */
router.get("/", validate(globalSearchQuerySchema, "query"), search);

export default router;
