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
        JobTitle: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Profesor de Matemáticas" },
            description: {
              type: "string",
              example: "Docente encargado de impartir clases de matemáticas",
            },
            jobTitleType: {
              type: "string",
              enum: ["teacher", "administrative-staff"],
              example: "teacher",
            },
            status: { type: "boolean", example: true },
          },
        },
        CreateJobTitleDto: {
          type: "object",
          required: ["name", "description", "jobTitleType"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Coordinador Académico",
            },
            description: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example: "Responsable de coordinar actividades académicas",
            },
            jobTitleType: {
              type: "string",
              enum: ["teacher", "administrative-staff"],
              example: "administrative-staff",
            },
          },
        },
        UpdateJobTitleDto: {
          type: "object",
          description:
            "At least one field required (name, description, or jobTitleType).",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            jobTitleType: {
              type: "string",
              enum: ["teacher", "administrative-staff"],
            },
          },
        },
        SecurityRole: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Administrador" },
            description: {
              type: "string",
              example: "Rol con acceso completo al sistema",
            },
            status: { type: "boolean", example: true },
          },
        },
        SecurityRoleDetail: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Administrador" },
            description: {
              type: "string",
              example: "Rol con acceso completo al sistema",
            },
            status: { type: "boolean", example: true },
            permissions: {
              type: "array",
              items: {
                $ref: "#/components/schemas/SecurityRolePermission",
              },
            },
          },
        },
        SecurityRolePermission: {
          type: "object",
          properties: {
            moduleKey: {
              type: "string",
              enum: [
                "dashboard",
                "my-account",
                "my-classes",
                "students",
                "academic-years",
                "announcements",
                "academic-levels",
                "school-subjects",
                "scholarships",
                "payment-concepts",
                "employees",
                "job-titles",
                "security-roles",
                "settings",
              ],
              example: "students",
            },
            canRead: { type: "boolean", example: true },
            canWrite: { type: "boolean", example: true },
            canDelete: { type: "boolean", example: false },
          },
        },
        CreateSecurityRoleDto: {
          type: "object",
          required: ["name", "description", "permissions"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Coordinador",
            },
            description: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example: "Rol de coordinación académica",
            },
            permissions: {
              type: "array",
              items: {
                $ref: "#/components/schemas/SecurityRolePermission",
              },
            },
          },
        },
        UpdateSecurityRoleDto: {
          type: "object",
          description:
            "At least one field required (name, description, or permissions).",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            permissions: {
              type: "array",
              items: {
                $ref: "#/components/schemas/SecurityRolePermission",
              },
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Omar" },
            firstLastName: { type: "string", example: "Trejo" },
            secondLastName: { type: "string", example: "García" },
            email: {
              type: "string",
              format: "email",
              example: "omar.trejo@colegiolear.com",
            },
            username: { type: "string", example: "otrejo" },
            image: {
              type: "string",
              nullable: true,
              example: "employees/abc123.jpg",
            },
            mustChangePassword: { type: "boolean", example: false },
            securityRole: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string", example: "Administrador" },
                permissions: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/SecurityRolePermission",
                  },
                },
              },
            },
            jobTitle: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string", example: "Profesor de Matemáticas" },
                jobTitleType: {
                  type: "string",
                  enum: ["teacher", "administrative-staff"],
                  example: "teacher",
                },
              },
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
        Employee: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Omar" },
            firstLastName: { type: "string", example: "Trejo" },
            secondLastName: { type: "string", example: "García" },
            phoneNumber: { type: "string", example: "5551234567" },
            email: {
              type: "string",
              format: "email",
              example: "omar.trejo@colegiolear.com",
            },
            username: { type: "string", example: "otrejo" },
            image: {
              type: "string",
              nullable: true,
              example: "employees/abc123.jpg",
            },
            status: { type: "boolean", example: true },
            securityRoleId: { type: "string", format: "uuid" },
            jobTitleId: { type: "string", format: "uuid" },
            jobTitle: { $ref: "#/components/schemas/JobTitle" },
            securityRole: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string", example: "Administrador" },
                description: {
                  type: "string",
                  example: "Rol con acceso completo",
                },
                status: { type: "boolean", example: true },
              },
            },
          },
        },
        EmployeeDetail: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Omar" },
            firstLastName: { type: "string", example: "Trejo" },
            secondLastName: { type: "string", example: "García" },
            phoneNumber: { type: "string", example: "5551234567" },
            email: {
              type: "string",
              format: "email",
              example: "omar.trejo@colegiolear.com",
            },
            username: { type: "string", example: "otrejo" },
            image: {
              type: "string",
              nullable: true,
              example: "employees/abc123.jpg",
            },
            status: { type: "boolean", example: true },
            securityRoleId: { type: "string", format: "uuid" },
            jobTitleId: { type: "string", format: "uuid" },
            jobTitle: { $ref: "#/components/schemas/JobTitle" },
            securityRole: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string", example: "Administrador" },
                description: {
                  type: "string",
                  example: "Rol con acceso completo",
                },
                status: { type: "boolean", example: true },
                permissions: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/SecurityRolePermission",
                  },
                },
              },
            },
          },
        },
        CreateEmployeeDto: {
          type: "object",
          required: [
            "name",
            "firstLastName",
            "secondLastName",
            "phoneNumber",
            "email",
            "securityRoleId",
            "jobTitleId",
          ],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Omar",
            },
            firstLastName: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Trejo",
            },
            secondLastName: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "García",
            },
            phoneNumber: {
              type: "string",
              minLength: 1,
              maxLength: 20,
              example: "5551234567",
            },
            email: {
              type: "string",
              format: "email",
              maxLength: 150,
              example: "omar.trejo@colegiolear.com",
            },
            securityRoleId: { type: "string", format: "uuid" },
            jobTitleId: { type: "string", format: "uuid" },
            file: {
              type: "string",
              format: "binary",
              description: "Optional profile image (jpeg, png, webp, gif)",
            },
          },
          description: "Multipart/form-data body for creating an employee",
        },
        UpdateEmployeeDto: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            firstLastName: { type: "string", minLength: 1, maxLength: 100 },
            secondLastName: { type: "string", minLength: 1, maxLength: 100 },
            phoneNumber: { type: "string", minLength: 1, maxLength: 20 },
            email: { type: "string", format: "email", maxLength: 150 },
            securityRoleId: { type: "string", format: "uuid" },
            jobTitleId: { type: "string", format: "uuid" },
            file: {
              type: "string",
              format: "binary",
              description: "Optional profile image (jpeg, png, webp, gif)",
            },
          },
          description:
            "Multipart/form-data body for updating an employee. All fields optional but at least one required.",
        },
        Announcement: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Reunión de padres" },
            description: {
              type: "string",
              example: "Reunión general de padres de familia",
            },
            audience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                    enum: ["administrative-staff", "teacher", "student"],
                    example: "teacher",
                  },
                  label: { type: "string", example: "Docentes" },
                },
              },
            },
            content: {
              type: "string",
              example: "<p>Se convoca a reunión general...</p>",
            },
            publishedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-15T00:00:00.000Z",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T00:00:00.000Z",
            },
            status: { type: "boolean", example: true },
          },
        },
        AnnouncementDetail: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Reunión de padres" },
            description: {
              type: "string",
              example: "Reunión general de padres de familia",
            },
            audience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                    enum: ["administrative-staff", "teacher", "student"],
                    example: "teacher",
                  },
                  label: { type: "string", example: "Docentes" },
                },
              },
            },
            content: {
              type: "string",
              example: "<p>Se convoca a reunión general...</p>",
            },
            publishedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-15T00:00:00.000Z",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T00:00:00.000Z",
            },
            status: { type: "boolean", example: true },
            attachments: {
              type: "array",
              items: { $ref: "#/components/schemas/Attachment" },
            },
          },
        },
        Attachment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            url: {
              type: "string",
              example: "announcements/abc123-document.pdf",
            },
            name: { type: "string", example: "document" },
            extension: { type: "string", example: "pdf" },
            relatedRecordId: { type: "string", format: "uuid" },
          },
        },
        CreateAnnouncementDto: {
          type: "object",
          required: [
            "name",
            "description",
            "audience",
            "content",
            "publishedAt",
            "expiresAt",
          ],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 200,
              example: "Reunión de padres",
            },
            description: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example: "Reunión general de padres de familia",
            },
            audience: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["key", "label"],
                properties: {
                  key: {
                    type: "string",
                    enum: ["administrative-staff", "teacher", "student"],
                  },
                  label: { type: "string" },
                },
              },
            },
            content: {
              type: "string",
              minLength: 1,
              example: "<p>Se convoca a reunión general...</p>",
            },
            publishedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-15T00:00:00.000Z",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T00:00:00.000Z",
            },
          },
        },
        UpdateAnnouncementDto: {
          type: "object",
          description: "At least one field required. All fields are optional.",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 200 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            audience: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                    enum: ["administrative-staff", "teacher", "student"],
                  },
                  label: { type: "string" },
                },
              },
            },
            content: { type: "string", minLength: 1 },
            publishedAt: { type: "string", format: "date-time" },
            expiresAt: { type: "string", format: "date-time" },
            status: { type: "boolean" },
          },
        },
      },
    },
  },
  /* Scan all route files for JSDoc annotations */
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.schema.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
