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
              nullable: true,
              example: "Educación primaria básica",
            },
            isActive: { type: "boolean", example: true },
          },
        },
        AcademicLevelDetail: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Primaria" },
            description: {
              type: "string",
              nullable: true,
              example: "Educación primaria básica",
            },
            isActive: { type: "boolean", example: true },
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
          required: ["name"],
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
            isActive: { type: "boolean", default: true },
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
            isActive: { type: "boolean" },
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
              nullable: true,
              example: "Docente encargado de impartir clases de matemáticas",
            },
            jobTitleType: {
              type: "string",
              enum: ["teacher", "administrative-staff"],
              example: "teacher",
            },
            isActive: { type: "boolean", example: true },
          },
        },
        CreateJobTitleDto: {
          type: "object",
          required: ["name", "jobTitleType"],
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
            isActive: { type: "boolean", default: true },
          },
        },
        UpdateJobTitleDto: {
          type: "object",
          description:
            "At least one field required (name, description, jobTitleType, or isActive).",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            jobTitleType: {
              type: "string",
              enum: ["teacher", "administrative-staff"],
            },
            isActive: { type: "boolean" },
          },
        },
        SecurityRole: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Administrador" },
            description: {
              type: "string",
              nullable: true,
              example: "Rol con acceso completo al sistema",
            },
            isActive: { type: "boolean", example: true },
          },
        },
        SecurityRoleDetail: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Administrador" },
            description: {
              type: "string",
              nullable: true,
              example: "Rol con acceso completo al sistema",
            },
            isActive: { type: "boolean", example: true },
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
                "academic-cycles",
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
          required: ["name"],
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
            isActive: { type: "boolean", default: true },
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
            "At least one field required (name, description, isActive, or permissions).",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            isActive: { type: "boolean" },
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
            secondLastName: {
              type: "string",
              nullable: true,
              example: "García",
            },
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
            error: { type: "string", example: "Validation failed" },
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
            secondLastName: {
              type: "string",
              nullable: true,
              example: "García",
            },
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
            isActive: { type: "boolean", example: true },
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
                isActive: { type: "boolean", example: true },
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
            secondLastName: {
              type: "string",
              nullable: true,
              example: "García",
            },
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
            isActive: { type: "boolean", example: true },
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
                isActive: { type: "boolean", example: true },
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
            isActive: { type: "boolean", default: true },
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
            isActive: { type: "boolean" },
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
              nullable: true,
              example: "Reunión general de padres de familia",
            },
            audience: {
              type: "array",
              items: {
                type: "string",
                enum: ["administrative-staff", "teacher", "student"],
                example: "teacher",
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
            isActive: { type: "boolean", example: true },
          },
        },
        AnnouncementDetail: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Reunión de padres" },
            description: {
              type: "string",
              nullable: true,
              example: "Reunión general de padres de familia",
            },
            audience: {
              type: "array",
              items: {
                type: "string",
                enum: ["administrative-staff", "teacher", "student"],
                example: "teacher",
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
            isActive: { type: "boolean", example: true },
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
          required: ["name", "audience", "publishedAt", "expiresAt"],
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
                type: "string",
                enum: ["administrative-staff", "teacher", "student"],
              },
            },
            content: {
              type: "string",
              description: "Optional at creation. Added later via update.",
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
            isActive: { type: "boolean", default: true },
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
                type: "string",
                enum: ["administrative-staff", "teacher", "student"],
              },
            },
            content: { type: "string", minLength: 1 },
            publishedAt: { type: "string", format: "date-time" },
            expiresAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
          },
        },
        // ─── Scholarships ───────────────────────────────────────────────────────
        ScholarshipRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Beca de excelencia" },
            description: {
              type: "string",
              nullable: true,
              example: "Beca para alumnos con promedio mayor a 9.5",
            },
            discountPercentage: {
              type: "number",
              format: "float",
              example: 50,
            },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateScholarshipBody: {
          type: "object",
          required: ["name", "discountPercentage"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Beca de excelencia",
            },
            description: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example: "Beca para alumnos con promedio mayor a 9.5",
            },
            discountPercentage: {
              type: "number",
              minimum: 0,
              maximum: 100,
              example: 50,
            },
            isActive: { type: "boolean", default: true, example: true },
          },
        },
        UpdateScholarshipBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            discountPercentage: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            isActive: { type: "boolean" },
          },
        },
        // ─── Payment Concepts ───────────────────────────────────────────────────
        PaymentConceptRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Colegiatura mensual" },
            description: {
              type: "string",
              nullable: true,
              example: "Pago mensual de colegiatura",
            },
            amount: { type: "number", format: "float", example: 1500 },
            allowForgiveness: { type: "boolean", example: true },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreatePaymentConceptBody: {
          type: "object",
          required: ["name", "amount"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Colegiatura mensual",
            },
            description: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example: "Pago mensual de colegiatura",
            },
            amount: {
              type: "number",
              minimum: 0,
              example: 1500,
            },
            allowForgiveness: { type: "boolean", example: true },
            isActive: { type: "boolean", default: true, example: true },
          },
        },
        UpdatePaymentConceptBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            amount: { type: "number", minimum: 0 },
            allowForgiveness: { type: "boolean" },
            isActive: { type: "boolean" },
          },
        },
        // ─── School Subjects ────────────────────────────────────────────────────
        SubjectView: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Matemáticas" },
            description: {
              type: "string",
              nullable: true,
              example: "Materia de matemáticas básicas",
            },
            isActive: { type: "boolean", example: true },
            academicLevelId: { type: "string", format: "uuid" },
            educationLevelId: { type: "string", format: "uuid" },
            academicLevel: { $ref: "#/components/schemas/AcademicLevel" },
            educationLevel: { $ref: "#/components/schemas/EducationLevel" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        SchoolSubjectRecord: {
          $ref: "#/components/schemas/SubjectView",
        },
        CreateSchoolSubjectBody: {
          type: "object",
          required: ["name", "academicLevelId", "educationLevelId"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Matemáticas",
            },
            description: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example: "Materia de matemáticas básicas",
            },
            academicLevelId: { type: "string", format: "uuid" },
            educationLevelId: { type: "string", format: "uuid" },
            isActive: { type: "boolean", default: true, example: true },
          },
        },
        UpdateSchoolSubjectBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", minLength: 1, maxLength: 500 },
            academicLevelId: { type: "string", format: "uuid" },
            educationLevelId: { type: "string", format: "uuid" },
            isActive: { type: "boolean" },
          },
        },
        // ─── Students ───────────────────────────────────────────────────────────
        StudentRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Juan" },
            firstLastName: { type: "string", example: "Pérez" },
            secondLastName: { type: "string", example: "García" },
            dateOfBirth: {
              type: "string",
              format: "date-time",
              example: "2010-05-15T00:00:00.000Z",
            },
            curp: { type: "string", example: "PEGJ100515HDFRRC09" },
            enrollment: { type: "string", example: "LR-2025-0001" },
            image: { type: "string", nullable: true },
            observations: { type: "string", nullable: true },
            isActive: { type: "boolean", example: true },
            bloodType: {
              type: "string",
              enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
              example: "O+",
            },
            medicalNotes: { type: "string", nullable: true },
            email: {
              type: "string",
              format: "email",
              example: "juan.perez@email.com",
            },
            phoneNumber: { type: "string", example: "5551234567" },
            address: { type: "string", example: "Av. Reforma 123" },
            state: { type: "string", example: "Ciudad de México" },
            municipality: { type: "string", example: "Cuauhtémoc" },
            postalCode: { type: "string", example: "06600" },
          },
        },
        CreateStudentBody: {
          type: "object",
          required: [
            "name",
            "firstLastName",
            "secondLastName",
            "dateOfBirth",
            "curp",
            "bloodType",
            "email",
            "phoneNumber",
            "address",
            "state",
            "municipality",
            "postalCode",
          ],
          properties: {
            name: { type: "string", maxLength: 100 },
            firstLastName: { type: "string", maxLength: 100 },
            secondLastName: { type: "string", maxLength: 100 },
            dateOfBirth: { type: "string", format: "date-time" },
            curp: { type: "string", maxLength: 18 },
            image: { type: "string", maxLength: 500 },
            observations: { type: "string", maxLength: 1000 },
            bloodType: {
              type: "string",
              enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
              example: "O+",
            },
            medicalNotes: { type: "string", maxLength: 1000 },
            email: { type: "string", format: "email", maxLength: 150 },
            phoneNumber: { type: "string", maxLength: 20 },
            address: { type: "string", maxLength: 300 },
            state: { type: "string", maxLength: 100 },
            municipality: { type: "string", maxLength: 100 },
            postalCode: { type: "string", maxLength: 10 },
            isActive: { type: "boolean", default: true },
          },
        },
        UpdateStudentBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            name: { type: "string", maxLength: 100 },
            firstLastName: { type: "string", maxLength: 100 },
            secondLastName: { type: "string", maxLength: 100 },
            dateOfBirth: { type: "string", format: "date-time" },
            curp: { type: "string", maxLength: 18 },
            image: { type: "string", maxLength: 500, nullable: true },
            observations: { type: "string", maxLength: 1000, nullable: true },
            bloodType: {
              type: "string",
              enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            },
            medicalNotes: { type: "string", maxLength: 1000, nullable: true },
            email: { type: "string", format: "email", maxLength: 150 },
            phoneNumber: { type: "string", maxLength: 20 },
            address: { type: "string", maxLength: 300 },
            state: { type: "string", maxLength: 100 },
            municipality: { type: "string", maxLength: 100 },
            postalCode: { type: "string", maxLength: 10 },
            isActive: { type: "boolean" },
          },
        },
        // ─── Student Guardians ──────────────────────────────────────────────────
        StudentGuardianRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            studentId: { type: "string", format: "uuid" },
            fullName: { type: "string", example: "María García López" },
            relationship: {
              type: "string",
              enum: [
                "father",
                "mother",
                "grandmother",
                "grandfather",
                "uncle",
                "aunt",
                "brother",
                "sister",
                "legal-guardian",
                "step-father",
                "step-mother",
                "other",
              ],
              example: "mother",
            },
            phoneNumber: { type: "string", example: "5559876543" },
            email: {
              type: "string",
              format: "email",
              example: "maria.garcia@email.com",
            },
            isPrincipal: { type: "boolean", example: true },
            emergencyContact: { type: "boolean", example: true },
            authorizedToPickUp: { type: "boolean", example: true },
            observations: { type: "string", nullable: true },
          },
        },
        CreateStudentGuardianBody: {
          type: "object",
          required: ["fullName", "relationship", "phoneNumber", "email"],
          properties: {
            fullName: { type: "string", maxLength: 200 },
            relationship: {
              type: "string",
              enum: [
                "father",
                "mother",
                "grandmother",
                "grandfather",
                "uncle",
                "aunt",
                "brother",
                "sister",
                "legal-guardian",
                "step-father",
                "step-mother",
                "other",
              ],
            },
            phoneNumber: { type: "string", maxLength: 20 },
            email: { type: "string", format: "email", maxLength: 150 },
            isPrincipal: { type: "boolean", default: false },
            emergencyContact: { type: "boolean", default: false },
            authorizedToPickUp: { type: "boolean", default: false },
            observations: { type: "string", maxLength: 500 },
          },
        },
        UpdateStudentGuardianBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            fullName: { type: "string", maxLength: 200 },
            relationship: {
              type: "string",
              enum: [
                "father",
                "mother",
                "grandmother",
                "grandfather",
                "uncle",
                "aunt",
                "brother",
                "sister",
                "legal-guardian",
                "step-father",
                "step-mother",
                "other",
              ],
            },
            phoneNumber: { type: "string", maxLength: 20 },
            email: { type: "string", format: "email", maxLength: 150 },
            isPrincipal: { type: "boolean" },
            emergencyContact: { type: "boolean" },
            authorizedToPickUp: { type: "boolean" },
            observations: { type: "string", maxLength: 500, nullable: true },
          },
        },
        // ─── Student Allergies ───────────────────────────────────────────────────
        // NOTE: bloodType/medicalNotes live directly on StudentRecord.
        // Allergies are their own sub-resource, one record at a time.
        AllergyRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            studentId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Penicilina" },
            severity: {
              type: "string",
              enum: ["mild", "moderate", "severe"],
              example: "moderate",
            },
            observations: { type: "string", nullable: true },
          },
        },
        CreateAllergyBody: {
          type: "object",
          required: ["name", "severity"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            severity: {
              type: "string",
              enum: ["mild", "moderate", "severe"],
            },
            observations: { type: "string", maxLength: 500 },
          },
        },
        UpdateAllergyBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            severity: {
              type: "string",
              enum: ["mild", "moderate", "severe"],
            },
            observations: { type: "string", maxLength: 500, nullable: true },
          },
        },
        // ─── Academic Cycles ────────────────────────────────────────────────────
        AcademicCycleRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "2026 - 2027" },
            code: { type: "string", example: "2026-A" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            periodType: {
              type: "string",
              enum: [
                "annual",
                "semester",
                "four-month-period",
                "trimester",
                "bimester",
                "monthly",
                "intensive",
                "special",
              ],
            },
            status: {
              type: "string",
              enum: [
                "upcoming",
                "active",
                "completed",
                "cancelled",
                "archived",
              ],
            },
            minimumPassingGrade: { type: "integer", minimum: 1, maximum: 10 },
            evaluationCount: { type: "integer", minimum: 1, maximum: 10 },
            enrollmentOpen: { type: "boolean", example: false },
            description: { type: "string", nullable: true },
            observations: { type: "string", nullable: true },
            academicLevelId: { type: "string", format: "uuid" },
            educationLevelId: { type: "string", format: "uuid" },
            academicLevel: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
            },
            educationLevel: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateAcademicCycleBody: {
          type: "object",
          required: [
            "name",
            "code",
            "startDate",
            "endDate",
            "periodType",
            "minimumPassingGrade",
            "evaluationCount",
            "academicLevelId",
            "educationLevelId",
          ],
          properties: {
            name: { type: "string", maxLength: 150 },
            code: { type: "string", maxLength: 50 },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            periodType: {
              type: "string",
              enum: [
                "annual",
                "semester",
                "four-month-period",
                "trimester",
                "bimester",
                "monthly",
                "intensive",
                "special",
              ],
            },
            status: {
              type: "string",
              enum: [
                "upcoming",
                "active",
                "completed",
                "cancelled",
                "archived",
              ],
            },
            minimumPassingGrade: { type: "integer", minimum: 1, maximum: 10 },
            evaluationCount: { type: "integer", minimum: 1, maximum: 10 },
            enrollmentOpen: { type: "boolean" },
            description: { type: "string", maxLength: 500 },
            observations: { type: "string", maxLength: 1000 },
            academicLevelId: { type: "string", format: "uuid" },
            educationLevelId: { type: "string", format: "uuid" },
          },
        },
        UpdateAcademicCycleBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            name: { type: "string", maxLength: 150 },
            code: { type: "string", maxLength: 50 },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            periodType: {
              type: "string",
              enum: [
                "annual",
                "semester",
                "four-month-period",
                "trimester",
                "bimester",
                "monthly",
                "intensive",
                "special",
              ],
            },
            status: {
              type: "string",
              enum: [
                "upcoming",
                "active",
                "completed",
                "cancelled",
                "archived",
              ],
            },
            minimumPassingGrade: { type: "integer", minimum: 1, maximum: 10 },
            evaluationCount: { type: "integer", minimum: 1, maximum: 10 },
            enrollmentOpen: { type: "boolean" },
            description: { type: "string", maxLength: 500, nullable: true },
            observations: { type: "string", maxLength: 1000, nullable: true },
            academicLevelId: { type: "string", format: "uuid" },
            educationLevelId: { type: "string", format: "uuid" },
          },
        },
        // ─── Academic Cycle School Subjects ─────────────────────────────────────
        AcademicCycleSchoolSubjectRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            academicCycleId: { type: "string", format: "uuid" },
            schoolSubjectId: { type: "string", format: "uuid" },
            observations: { type: "string", nullable: true },
            schoolSubject: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                description: { type: "string", nullable: true },
              },
            },
          },
        },
        CreateAcademicCycleSchoolSubjectBody: {
          type: "object",
          required: ["schoolSubjectId"],
          properties: {
            schoolSubjectId: { type: "string", format: "uuid" },
            observations: { type: "string", maxLength: 500 },
          },
        },
        UpdateAcademicCycleSchoolSubjectBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            schoolSubjectId: { type: "string", format: "uuid" },
            observations: { type: "string", maxLength: 500, nullable: true },
          },
        },
        // ─── Academic Cycle Wallet ──────────────────────────────────────────────
        AcademicCycleWalletRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            academicCycleId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Inscripción" },
            description: { type: "string", nullable: true },
            dueDate: { type: "string", format: "date-time" },
            amount: { type: "number", example: 1500 },
            allowForgiveness: { type: "boolean", example: false },
          },
        },
        CreateAcademicCycleWalletBody: {
          type: "object",
          required: ["name", "dueDate", "amount"],
          properties: {
            name: { type: "string", maxLength: 100 },
            description: { type: "string", maxLength: 500 },
            dueDate: { type: "string", format: "date-time" },
            amount: { type: "number", minimum: 0.01 },
            allowForgiveness: { type: "boolean" },
          },
        },
        UpdateAcademicCycleWalletBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            name: { type: "string", maxLength: 100 },
            description: { type: "string", maxLength: 500 },
            dueDate: { type: "string", format: "date-time" },
            amount: { type: "number", minimum: 0.01 },
            allowForgiveness: { type: "boolean" },
          },
        },
        // ─── Academic Cycle School Groups ────────────────────────────────────────
        AcademicCycleSchoolGroupCalendarRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            day: {
              type: "string",
              enum: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ],
            },
            startTime: { type: "string", example: "08:00" },
            endTime: { type: "string", example: "09:00" },
            academicCycleId: { type: "string", format: "uuid" },
            academicCycleSchoolGroupId: { type: "string", format: "uuid" },
            schoolSubjectId: { type: "string", format: "uuid" },
            schoolSubject: { $ref: "#/components/schemas/SchoolSubjectRecord" },
            teacherId: { type: "string", format: "uuid" },
            teacher: { $ref: "#/components/schemas/Employee" },
          },
        },
        AcademicCycleSchoolGroupCalendarBody: {
          type: "object",
          required: ["day", "startTime", "endTime", "schoolSubjectId", "teacherId"],
          properties: {
            id: {
              type: "string",
              description:
                'Existing UUID = update; absent or prefixed "new_"/"new-" = create.',
            },
            day: {
              type: "string",
              enum: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ],
            },
            startTime: { type: "string", example: "08:00" },
            endTime: { type: "string", example: "09:00" },
            schoolSubjectId: { type: "string", format: "uuid" },
            teacherId: { type: "string", format: "uuid" },
          },
        },
        AcademicCycleSchoolGroupRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Primero A (2026-2027)" },
            status: { type: "string", enum: ["active", "discharged"] },
            description: { type: "string", nullable: true },
            dischargedDescription: { type: "string", nullable: true },
            academicCycleId: { type: "string", format: "uuid" },
            calendars: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AcademicCycleSchoolGroupCalendarRecord",
              },
            },
          },
        },
        CreateAcademicCycleSchoolGroupBody: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", maxLength: 100 },
            status: { type: "string", enum: ["active", "discharged"] },
            description: { type: "string", maxLength: 500 },
            dischargedDescription: { type: "string", maxLength: 500 },
            calendars: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AcademicCycleSchoolGroupCalendarBody",
              },
            },
          },
        },
        UpdateAcademicCycleSchoolGroupBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            name: { type: "string", maxLength: 100 },
            status: { type: "string", enum: ["active", "discharged"] },
            description: { type: "string", maxLength: 500, nullable: true },
            dischargedDescription: {
              type: "string",
              maxLength: 500,
              nullable: true,
            },
            calendars: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AcademicCycleSchoolGroupCalendarBody",
              },
              description:
                "Full replacement set: syncs creates/updates/deletes against existing calendars.",
            },
          },
        },
        AcademicCycleSchoolGroupTeacherRecord: {
          type: "object",
          properties: {
            schoolSubjectId: { type: "string", format: "uuid" },
            schoolSubject: { $ref: "#/components/schemas/SchoolSubjectRecord" },
            teacherId: { type: "string", format: "uuid" },
            teacher: { $ref: "#/components/schemas/Employee" },
          },
        },
        // ─── Academic Cycle Enrollments ──────────────────────────────────────────
        AcademicCycleEnrollmentRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            code: { type: "string", example: "INS-2026-0001" },
            status: { type: "string", enum: ["enrolled", "completed", "dropped"] },
            observations: { type: "string", nullable: true },
            droppedNotes: { type: "string", nullable: true },
            studentId: { type: "string", format: "uuid" },
            student: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                firstLastName: { type: "string" },
                secondLastName: { type: "string" },
                enrollment: { type: "string", example: "LR-2026-0001" },
              },
            },
            academicCycleId: { type: "string", format: "uuid" },
            academicCycle: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
            },
            academicCycleSchoolGroupId: { type: "string", format: "uuid" },
            academicCycleSchoolGroup: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
            },
            scholarshipId: { type: "string", format: "uuid", nullable: true },
            scholarship: {
              type: "object",
              nullable: true,
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                discountPercentage: { type: "number" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateAcademicCycleEnrollmentBody: {
          type: "object",
          required: ["studentId", "academicCycleSchoolGroupId"],
          properties: {
            status: { type: "string", enum: ["enrolled", "completed", "dropped"] },
            observations: { type: "string", maxLength: 1000 },
            droppedNotes: { type: "string", maxLength: 1000 },
            studentId: { type: "string", format: "uuid" },
            academicCycleSchoolGroupId: { type: "string", format: "uuid" },
            scholarshipId: { type: "string", format: "uuid" },
          },
        },
        UpdateAcademicCycleEnrollmentBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            status: { type: "string", enum: ["enrolled", "completed", "dropped"] },
            observations: { type: "string", maxLength: 1000, nullable: true },
            droppedNotes: { type: "string", maxLength: 1000, nullable: true },
            academicCycleSchoolGroupId: { type: "string", format: "uuid" },
            scholarshipId: { type: "string", format: "uuid", nullable: true },
          },
        },
        // ─── Student Grades ────────────────────────────────────────────────────
        StudentGradeRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            grade: { type: "number", example: 9.5 },
            evaluationNumber: { type: "integer", example: 1 },
            schoolSubjectId: { type: "string", format: "uuid" },
            schoolSubject: { $ref: "#/components/schemas/SchoolSubjectRecord" },
            academicCycleEnrollmentId: { type: "string", format: "uuid" },
          },
        },
        // ─── Student Wallet ─────────────────────────────────────────────────────
        StudentWalletItemRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            dueDate: { type: "string", format: "date-time" },
            amount: { type: "number" },
            allowForgiveness: { type: "boolean" },
            outstandingAmount: { type: "number" },
            isForgiven: { type: "boolean" },
            extensionDate: { type: "string", format: "date-time", nullable: true },
            status: {
              type: "string",
              enum: ["pending", "paid", "overdue", "forgiven"],
              description: "Computed on every read, not stored.",
            },
            academicCycleEnrollmentId: { type: "string", format: "uuid" },
            academicCycleId: { type: "string", format: "uuid" },
            studentId: { type: "string", format: "uuid" },
            academicCycleWalletId: { type: "string", format: "uuid" },
          },
        },
        StudentWalletRecord: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                total: { type: "number" },
                outstanding: { type: "number" },
                paid: { type: "number" },
                overdue: { type: "number" },
              },
            },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/StudentWalletItemRecord" },
            },
          },
        },
        UpdateStudentWalletItemBody: {
          type: "object",
          description: "At least one field required.",
          properties: {
            allowForgiveness: { type: "boolean" },
            isForgiven: { type: "boolean" },
            extensionDate: { type: "string", format: "date-time", nullable: true },
          },
        },
        StudentWalletPaymentRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            folio: { type: "string", example: "PAG-2026-000001" },
            amount: { type: "number" },
            createAt: { type: "string", format: "date-time" },
            paymentMethod: { type: "string", enum: ["online-payment", "cash"] },
            academicCycleId: { type: "string", format: "uuid" },
            academicCycleEnrollmentId: { type: "string", format: "uuid" },
            studentWalletItemId: { type: "string", format: "uuid" },
          },
        },
        CreateStudentWalletPaymentBody: {
          type: "object",
          required: ["amount", "paymentMethod"],
          properties: {
            amount: { type: "integer", minimum: 1 },
            paymentMethod: { type: "string", enum: ["online-payment", "cash"] },
            studentWalletItemId: {
              type: "string",
              format: "uuid",
              description: "Ignored — the item id in the URL path is authoritative.",
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
