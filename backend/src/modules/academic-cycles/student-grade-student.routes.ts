import { Router } from "express";
import { findAllGrades } from "./student-grade-student.controller";

/**
 * Serves the same URL as the equivalent route in academic-cycle.routes.ts
 * (mounted after this router in index.ts, under the employee
 * authenticate/authorize) but for a student session. Single handler — see
 * gate-student-session.middleware.ts for why splitting the gate check into
 * its own chained middleware would break the fallthrough to the employee
 * router.
 */
const router = Router();

router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades",
  findAllGrades,
);

export default router;
