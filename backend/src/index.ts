import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./shared/swagger.config";
import { env } from "./shared/config/env.config";
import { requestLogger } from "./shared/middleware/request-logger.middleware";
import { errorHandler } from "./shared/middleware/error-handler.middleware";
import { authenticate } from "./shared/middleware/auth.middleware";

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
import announcementRoutes from "./modules/announcements/announcement.routes";
import attachmentRoutes from "./modules/attachments/attachment.routes";
import studentRoutes from "./modules/students/student.routes";

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

/* --- Swagger API Docs --- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/* --- Global Error Handler (must be last) --- */
app.use(errorHandler);

/* --- Start Server --- */
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📄 API Docs available at http://localhost:${env.PORT}/api-docs`);
});

export default app;
