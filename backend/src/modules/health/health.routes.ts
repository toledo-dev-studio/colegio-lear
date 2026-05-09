import { Router } from "express";
import { getHealth } from "./health.controller";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Server health check
 *     description: Returns current server status, version info, and uptime. Designed for load balancer probes.
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 name:
 *                   type: string
 *                   example: api-colegio-lear
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 description:
 *                   type: string
 *                   example: Apis de conexión para plataforma web
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-04-14T18:30:00.000Z"
 */
router.get("/health", getHealth);

export default router;
