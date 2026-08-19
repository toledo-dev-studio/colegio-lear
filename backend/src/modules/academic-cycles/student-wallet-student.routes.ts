import { Router } from "express";
import { findWallet, findPayments } from "./student-wallet-student.controller";

/**
 * Serves the same URLs as the equivalent routes in academic-cycle.routes.ts
 * (mounted after this router in index.ts, under the employee
 * authenticate/authorize) but for a student session. Each route has exactly
 * ONE handler — see gate-student-session.middleware.ts for why splitting
 * the gate check into its own chained middleware would break the
 * fallthrough to the employee router.
 */
const router = Router();

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/wallet:
 *   get:
 *     tags:
 *       - Student Wallet (Student)
 *     summary: Get the authenticated student's own wallet for an enrollment
 *     description: Student-portal version of GET .../wallet — requires a student session (cookie access_token) and that the enrollment belongs to the student. Falls through to the employee-authorized version of this same route when the session isn't a student's.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Wallet summary + items
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudentWalletRecord' }
 *       401:
 *         description: No student session
 *       404:
 *         description: Enrollment not found, or doesn't belong to the student
 */
router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet",
  findWallet,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/wallet/payments:
 *   get:
 *     tags:
 *       - Student Wallet (Student)
 *     summary: List payments registered against the authenticated student's own wallet
 *     description: Student-portal version of GET .../wallet/payments — same access rules as .../wallet above.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/StudentWalletPaymentRecord' }
 *       401:
 *         description: No student session
 *       404:
 *         description: Enrollment not found, or doesn't belong to the student
 */
router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/payments",
  findPayments,
);

export default router;
