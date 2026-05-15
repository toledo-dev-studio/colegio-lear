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
    components: {
      schemas: {
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            total: { type: "integer", example: 50 },
            totalPages: { type: "integer", example: 5 },
          },
        },
        AcademicLevel: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Primaria" },
            description: {
              type: "string",
              example: "Educación primaria básica",
            },
            status: { type: "boolean", example: true },
          },
        },
        AcademicLevelDetail: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Primaria" },
            description: {
              type: "string",
              example: "Educación primaria básica",
            },
            status: { type: "boolean", example: true },
            educationLevels: {
              type: "array",
              items: { $ref: "#/components/schemas/EducationLevel" },
            },
          },
        },
        EducationLevel: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "1° Primaria" },
            description: {
              type: "string",
              nullable: true,
              example: "Primer grado de primaria",
            },
            academicLevelId: { type: "string", format: "uuid" },
          },
        },
        CreateAcademicLevelDto: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Preparatoria",
            },
            description: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example: "Educación media superior",
            },
            educationLevels: {
              type: "array",
              description:
                "Optional education levels to create with the academic level",
              items: { $ref: "#/components/schemas/EducationLevelInput" },
            },
          },
        },
        UpdateAcademicLevelDto: {
          type: "object",
          description:
            "At least one field required. educationLevels syncs: new-* ids create, existing ids update, missing ids delete.",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            status: { type: "boolean" },
            educationLevels: {
              type: "array",
              description:
                "Full list of education levels. IDs starting with 'new-' are created, existing IDs are updated, omitted IDs are deleted.",
              items: { $ref: "#/components/schemas/EducationLevelInput" },
            },
          },
        },
        EducationLevelInput: {
          type: "object",
          required: ["id", "name"],
          description:
            "Education level input for create/update. Use 'new-*' as id for new records.",
          properties: {
            id: {
              type: "string",
              example: "new-1",
              description:
                "Use 'new-*' for new records or an existing UUID to update",
            },
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "1° Primaria",
            },
            description: {
              type: "string",
              maxLength: 500,
              nullable: true,
              example: "Primer grado de primaria",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            code: { type: "integer", example: 400 },
            message: { type: "string", example: "Validation failed" },
            details: {
              type: "array",
              nullable: true,
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  /* Scan all route files for JSDoc annotations */
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.schema.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
