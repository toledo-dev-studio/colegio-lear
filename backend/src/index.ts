import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./shared/swagger.config";
import { env } from "./shared/config/env.config";
import { requestLogger } from "./shared/middleware/request-logger.middleware";
import { errorHandler } from "./shared/middleware/error-handler.middleware";
import { authenticate } from "./shared/middleware/auth.middleware";
import { startNotificationDeliveryJob } from "./shared/jobs/notification-delivery.job";

/* --- Module Routes --- */
import healthRoutes from "./modules/health/health.routes";
import schoolSubjectRoutes from "./modules/school-subjects/school-subject.routes";
import academicLevelRoutes from "./modules/academic-levels/academic-level.routes";
import scholarshipRoutes from "./modules/scholarships/scholarship.routes";
import paymentConceptRoutes from "./modules/payment-concepts/payment-concept.routes";
import jobTitleRoutes from "./modules/job-titles/job-title.routes";
import securityRoleRoutes from "./modules/security-roles/security-role.routes";
import employeeRoutes from "./modules/employees/employee.routes";
import authRoutes from "./modules/auth/auth.routes";
import authStudentRoutes from "./modules/auth/auth-student.routes";
import announcementRoutes from "./modules/announcements/announcement.routes";
import attachmentRoutes from "./modules/attachments/attachment.routes";
import studentRoutes from "./modules/students/student.routes";
import studentMeRoutes from "./modules/students/student-me.routes";
import chatRoutes from "./modules/chats/chat.routes";
import academicCycleRoutes from "./modules/academic-cycles/academic-cycle.routes";
import academicCycleSchoolGroupStudentRoutes from "./modules/academic-cycles/academic-cycle-school-group-student.routes";
import studentGradeStudentRoutes from "./modules/academic-cycles/student-grade-student.routes";
import studentWalletStudentRoutes from "./modules/academic-cycles/student-wallet-student.routes";
import studentAssistStudentRoutes from "./modules/academic-cycles/student-assist-student.routes";
import schoolSubjectTaskStudentRoutes from "./modules/academic-cycles/school-subject-task-student.routes";
import schoolSubjectMaterialStudentRoutes from "./modules/academic-cycles/school-subject-material-student.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import globalSearchRoutes from "./modules/global-search/global-search.routes";
import notificationRoutes from "./modules/notifications/notification.routes";

/** Create Express application */
const app = express();

/* --- Global Middlewares --- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(requestLogger);

/* --- Public Routes (no authentication required) --- */
app.use(healthRoutes);
app.use("/auth", authRoutes);
app.use("/auth/student", authStudentRoutes);

/*
 * Serve locally-stored files (avatars, attachments) publicly so <img src>
 * tags can load them directly — local-testing stopgap until real blob
 * storage (Azure) is configured. See shared/helpers/file-url.helper.ts,
 * which builds the matching absolute URL for API responses.
 */
if (env.STORAGE_PROVIDER === "local") {
  app.use("/uploads", express.static(path.resolve(env.STORAGE_LOCAL_PATH)));
}

/* --- Swagger API Docs --- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*
 * Student portal routes — protected by authenticateStudent (own JWT payload),
 * never by the employee `authenticate`/`authorize()` below. Mounted here,
 * before the global employee `authenticate`, so a request to /students/me
 * is fully handled by this router and never falls through to it.
 */
app.use("/students/me", studentMeRoutes);
app.use("/students", chatRoutes);

/*
 * Student portal routes with their own URLs (no employee-side counterpart
 * exists yet) — same reasoning as /students/me above, just no gate needed.
 */
app.use("/academic-cycles", schoolSubjectTaskStudentRoutes);
app.use("/academic-cycles", schoolSubjectMaterialStudentRoutes);

/*
 * Student portal routes that share their exact URL with an employee-facing
 * route mounted below (e.g. GET /academic-cycles/:id/school-groups/:id/calendars).
 * Each route gates on the session type itself (see
 * gate-student-session.middleware.ts) and falls through to the employee
 * router below when the request isn't a student session — so it must be
 * mounted here, before `authenticate`, same reasoning as /students/me above.
 */
app.use("/academic-cycles", academicCycleSchoolGroupStudentRoutes);
app.use("/academic-cycles", studentGradeStudentRoutes);
app.use("/academic-cycles", studentWalletStudentRoutes);
app.use("/academic-cycles", studentAssistStudentRoutes);

/* --- Protected Routes (authentication required) --- */
app.use(authenticate);
app.use("/school-subjects", schoolSubjectRoutes);
app.use("/academic-levels", academicLevelRoutes);
app.use("/scholarships", scholarshipRoutes);
app.use("/payment-concepts", paymentConceptRoutes);
app.use("/job-titles", jobTitleRoutes);
app.use("/security-roles", securityRoleRoutes);
app.use("/employees", employeeRoutes);
app.use("/announcements", announcementRoutes);
app.use("/attachments", attachmentRoutes);
app.use("/students", studentRoutes);
app.use("/academic-cycles", academicCycleRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/global-search", globalSearchRoutes);
app.use("/notifications", notificationRoutes);

/* --- Global Error Handler (must be last) --- */
app.use(errorHandler);

/* --- Start Server --- */
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📄 API Docs available at http://localhost:${env.PORT}/api-docs`);
});

/* --- Background Jobs --- */
startNotificationDeliveryJob();

export default app;
