import swaggerJsdoc from "swagger-jsdoc";

/** Swagger/OpenAPI configuration for API documentation */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Colegio Lear API",
      version: "1.0.0",
      description: "API documentation for Colegio Lear platform",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  /* Scan all route files for JSDoc annotations */
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.schema.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
