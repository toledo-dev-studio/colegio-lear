import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./shared/swagger.config";
import healthRoutes from "./modules/health/health.routes";

/** Create Express application */
const app = express();

/** Port configuration from environment or default */
const PORT: number = Number(process.env["PORT"]) || 3000;

/* --- Global Middlewares --- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --- Swagger API Docs --- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* --- Routes --- */
app.use(healthRoutes);

/* --- Start Server --- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 API Docs available at http://localhost:${PORT}/api-docs`);
});

export default app;
