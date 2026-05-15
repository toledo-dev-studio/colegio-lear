import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./shared/swagger.config";
import { env } from "./shared/config/env.config";
import { requestLogger } from "./shared/middleware/request-logger.middleware";
import { errorHandler } from "./shared/middleware/error-handler.middleware";

/* --- Module Routes --- */
import healthRoutes from "./modules/health/health.routes";
import schoolSubjectRoutes from "./modules/school-subjects/school-subject.routes";

/** Create Express application */
const app = express();

/* --- Global Middlewares --- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

/* --- Routes --- */
app.use(healthRoutes);
app.use("/school-subjects", schoolSubjectRoutes);

/* --- Swagger API Docs --- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* --- Global Error Handler (must be last) --- */
app.use(errorHandler);

/* --- Start Server --- */
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📄 API Docs available at http://localhost:${env.PORT}/api-docs`);
});

export default app;
