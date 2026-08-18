import { Router } from "express";
import {
  findAllCalendars,
  findAllTeachers,
} from "./academic-cycle-school-group-student.controller";

/**
 * Serves the same URLs as the equivalent routes in academic-cycle.routes.ts
 * (mounted after this router in index.ts, under the employee
 * authenticate/authorize) but for a student session. Each route here has
 * exactly ONE handler — see gate-student-session.middleware.ts for why
 * splitting the gate check into its own chained middleware would break the
 * fallthrough to the employee router.
 */
const router = Router();

router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/calendars",
  findAllCalendars,
);

router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/teachers",
  findAllTeachers,
);

export default router;
