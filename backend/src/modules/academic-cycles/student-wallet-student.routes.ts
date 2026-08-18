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

router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet",
  findWallet,
);

router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/payments",
  findPayments,
);

export default router;
