import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./shared/swagger.config";
import { env } from "./shared/config/env.config";
import { requestLogger } from "./shared/middleware/request-logger.middleware";
import { errorHandler } from "./shared/middleware/error-handler.middleware";

/* --- Module Routes --- */
import healthRoutes from "./modules/health/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import employeeRoutes from "./modules/employees/employees.routes";
import profileRoutes from "./modules/profiles/profiles.routes";
import auditRoutes from "./modules/audit/audit.routes";
import educationLevelRoutes from "./modules/education-levels/education-levels.routes";
import gradeRoutes from "./modules/grades/grades.routes";
import groupRoutes from "./modules/groups/groups.routes";
import subjectRoutes from "./modules/subjects/subjects.routes";

/** Create Express application */
const app = express();

/* --- Global Middlewares --- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

/* --- Swagger API Docs --- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* --- Routes --- */
app.use(healthRoutes);
app.use(authRoutes);
app.use(employeeRoutes);
app.use(profileRoutes);
app.use(auditRoutes);
app.use(educationLevelRoutes);
app.use(gradeRoutes);
app.use(groupRoutes);
app.use(subjectRoutes);

/* --- Global Error Handler (must be last) --- */
app.use(errorHandler);

/* --- Start Server --- */
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📄 API Docs available at http://localhost:${env.PORT}/api-docs`);
});

export default app;
