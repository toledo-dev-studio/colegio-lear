# SERVICIOS PORTAL ALUMNO — Especificación de Endpoints Backend

> Documento de referencia para el desarrollo del backend del portal del alumno (`student-web`).
> Describe **todos** los endpoints que el backend debe exponer para que el frontend del alumno funcione en modo real (sin mocks).
> Fuente del contrato: archivos `api/*.ts` y `interfaces/*` de `frontend/student-web`.

---

## 1. Estado general

| Estado | Significado |
|---|---|
| **Existe** | El endpoint ya está implementado en el backend y cumple el contrato |
| **Parcial** | Existe algo similar, pero no cumple el contrato exacto del portal alumno (se detalla en cada caso) |
| **Pendiente** | No existe en el backend; debe implementarse |

**Resumen:**

| Módulo | Endpoints | Estado |
|---|---|---|
| Autenticación | 5 | Pendiente (el backend solo tiene auth de empleados) |
| Mi cuenta | 4 | Pendiente (el módulo de alumnos del backend está orientado a empleados: `/:studentId/...`) |
| Inscripciones | 1 | Existe |
| Calificaciones | 1 | Existe |
| Cartera | 2 | Existe |
| Horario / Docentes | 2 | Existe |
| Materias (tareas/materiales) | 2 | Pendiente |
| Chats | 3 | Pendiente |
| Asistencias | 1 | Pendiente |
| Notificaciones | 2 | Parcial |
| Comunicados | 1 | Existe |

---

## 2. Convenciones globales

### 2.1 Base URL y sesión

- Todos los endpoints se montan bajo el mismo origen del API (`app.use(...)` en `src/index.ts`), igual que los módulos existentes.
- Autenticación por **cookie HttpOnly `access_token`** (JWT), con fallback `Authorization: Bearer <token>`.
- El token de alumno debe replicar el patrón del token de empleado (`src/shared/middleware/auth.middleware.ts`):
  - Payload propuesto: `{ studentId, email }`.
  - **Expiración deslizante** (sliding expiration): en cada request exitoso se emite un JWT nuevo y se refresca la cookie.
  - Respuesta `401` cuando el token falta, es inválido o expiró (el frontend limpia la sesión automáticamente al recibir 401).
- Los endpoints de alumno **no** deben pasar por `authorize(<moduleKey>)` (RBAC de empleados); solo por un middleware equivalente a `authenticate` que valide el JWT de alumno.
- `CORS_ORIGIN` debe incluir el origen del portal alumno (o el que ya esté configurado).

### 2.2 Formato de respuestas

- Éxito simple (el frontend tipa la respuesta contra el contrato de cada endpoint):

```json
{ ...campos del recurso }
```

- Éxito paginado (contrato `PagedResponse<T>` de `frontend/student-web/src/interfaces/responses/paged.response.ts`):

```json
{
  "data": [],
  "totalPages": 1,
  "currentPage": 1,
  "itemsCount": 0
}
```

- Error (helper `sendError` de `src/shared/helpers/response.helper.ts`):

```json
{
  "error": "Mensaje de error",
  "details": [ { "field": "campo", "message": "Detalle" } ]
}
```

### 2.3 Paginación

- Parámetros de query: `page` (>= 1, default `1`) y `pageSize` (1..100, default según endpoint).
- El backend existente valida con Zod: `z.coerce.number().int().positive()`.
- La respuesta siempre usa `sendPaginatedSuccess` → `{ data, totalPages, currentPage, itemsCount }`.

### 2.4 Fechas

- Fechas con hora: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.mmmZ`), p. ej. `createdAt`, `sentAt`.
- Fechas de día (asistencia): ISO (`YYYY-MM-DDTHH:mm:ss.mmmZ`); el frontend compara solo la parte `YYYY-MM-DD`.
- Filtros de rango (`fromDate`, `toDate`): aceptar ISO o `YYYY-MM-DD`; el filtro es **inclusive**.

### 2.5 Validación

- Zod, con el mismo estilo que los módulos existentes (`validate(schema, "body" | "query" | "params")`).
- Params UUID: `z.string().uuid()`.

---

## 3. Autenticación — `/auth/student`

> Estado: **Pendiente** (el backend solo tiene `/auth/login`, `/auth/me`, etc. para empleados).
> El modelo `Student` ya cuenta con `password`, `mustChangePassword`, `email` y `enrollment` (campo `curp` único, etc.), así que no requiere migración de modelo para login.

### 3.1 POST /auth/student/login

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/auth/student/login` |
| **Auth** | Pública |
| **Body** | `{ "username": string, "password": string }` — `username` acepta **email o matrícula** (`AuthRequest`) |
| **Respuesta 200** | Objeto `AuthResponse` (ver abajo) + setea cookie `access_token` |
| **Errores** | `400` validación, `401` credenciales inválidas, `403` alumno inactivo / baja (`isActive=false` o `isDeleted=true`) |
| **Frontend** | `src/modules/auth/api/login.api.ts` |

Estructura de `AuthResponse` (fuente: `src/interfaces/responses/auth.response.ts`):

> **IMPORTANTE — Payload mínimo:** el response debe contener **solo los campos que el portal alumno consume** (verificado contra el código de `student-web`). El resto de campos del modelo (p. ej. `email` del alumno, `code`/`observations`/`droppedNotes`/`studentId` de la inscripción, `enrollmentOpen` o niveles académicos del ciclo) **no deben incluirse** en esta respuesta, para mantener el payload ligero. El `email` se obtiene vía `GET /students/me` cuando la pantalla "Mi cuenta" lo requiere.

```json
{
  "id": "uuid-alumno",
  "fullName": "Nombre completo",
  "enrollment": "LR-2026-0001",
  "avatar": "https://.../avatar.png",
  "isActive": true,
  "mustChangePassword": false,
  "enrollments": [
    {
      "id": "uuid-inscripcion",
      "status": "enrolled",
      "academicCycleId": "uuid-ciclo",
      "academicCycle": {
        "id": "uuid-ciclo",
        "name": "2026 - 2027",
        "code": "2026-A",
        "periodType": "annual",
        "status": "active",
        "minimumPassingGrade": 6,
        "evaluationCount": 3,
        "startDate": "2026-08-10T00:00:00.000Z",
        "endDate": "2027-07-09T23:59:59.999Z"
      },
      "academicCycleSchoolGroupId": "uuid-grupo",
      "academicCycleSchoolGroup": {
        "name": "Primero A (2026-2027)",
        "description": "Grupo de estudiantes del primer año"
      },
      "scholarship": null
    }
  ]
}
```

**Campos consumidos por `student-web` (único contrato válido):**

| Nivel | Campo | Dónde se usa en el frontend |
|---|---|---|
| Raíz | `id` | Sesión (`auth.store`), reset de contraseña (`ResetPasswordPage`) |
| Raíz | `fullName` | Navbar (`AccountInfoButton`), títulos de página (`ModulePageTitle`) |
| Raíz | `enrollment` | Dashboard (`AcademicCycleOverview` → "Matricula") |
| Raíz | `avatar` | Navbar (`AccountInfoButton`) |
| Raíz | `isActive` | Guard de rutas (`protected.router`) |
| Raíz | `mustChangePassword` | Guard de rutas (redirección a reset de contraseña) |
| Raíz | `enrollments[]` | Store de inscripciones (`enrollment.store`) |
| Enrollment | `id` | Selector de inscripción, ids de queries |
| Enrollment | `status` | Dashboard (`AcademicCycleOverview` → "Estatus de inscripción") |
| Enrollment | `academicCycleId` | Relación con el ciclo |
| Enrollment | `academicCycleSchoolGroupId` | Queries de horario y materias |
| Enrollment | `academicCycle.id` | Queries por ciclo (calificaciones, cartera, asistencias) |
| Enrollment | `academicCycle.name` | Selector de inscripción del navbar |
| Enrollment | `academicCycle.code` | Selector de inscripción, títulos de página, dashboard |
| Enrollment | `academicCycle.periodType` | Dashboard (hint "Periodo") |
| Enrollment | `academicCycle.status` | Selección default de inscripción (`enrollment.store`) |
| Enrollment | `academicCycle.minimumPassingGrade` | Pantalla de calificaciones |
| Enrollment | `academicCycle.evaluationCount` | Pantalla de calificaciones |
| Enrollment | `academicCycle.startDate` | Ordenamiento de inscripciones, títulos de página |
| Enrollment | `academicCycle.endDate` | Títulos de página (`ModulePageTitle`) |
| Enrollment | `academicCycleSchoolGroup.name` | Selector de inscripción, dashboard |
| Enrollment | `academicCycleSchoolGroup.description` | Dashboard (hint del grupo) |
| Enrollment | `scholarship.name` | Dashboard ("Beca") |
| Enrollment | `scholarship.discountPercentage` | Dashboard (hint "% de descuento") |

### 3.2 POST /auth/student/logout

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/auth/student/logout` |
| **Auth** | Sesión de alumno (cookie) |
| **Body** | — |
| **Respuesta 200** | `null` (limpia la cookie `access_token`) |
| **Frontend** | `src/modules/auth/api/logout.api.ts` |

### 3.3 GET /auth/student/me

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/auth/student/me` |
| **Auth** | Sesión de alumno (cookie) |
| **Query** | — |
| **Respuesta 200** | Mismo `AuthResponse` del login (con `enrollments` actualizadas) |
| **Errores** | `401` sin sesión |
| **Frontend** | `src/modules/auth/api/me.api.ts` — se llama en el bootstrap de la app (`checkAuthStatus`) |

### 3.4 POST /auth/student/request-reset-password

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/auth/student/request-reset-password` |
| **Auth** | Pública |
| **Body** | `{ "email": string }` |
| **Respuesta 200** | `null` — respuesta idéntica sin importar si el email existe (evita enumeración), igual que la versión de empleados |
| **Errores** | `400` email inválido |
| **Frontend** | `src/modules/auth/api/request-reset-password.api.ts` |

> Flujo esperado: generar código de 6 dígitos, guardarlo con expiración en el modelo del alumno (análogo a `add_password_reset_code_to_employees` del backend) y enviarlo por correo.

### 3.5 POST /auth/student/reset-password

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/auth/student/reset-password` |
| **Auth** | Sesión de alumno con `mustChangePassword = true` (el alumno inició sesión con la contraseña temporal; el frontend redirige a `/auth/reset-password`) |
| **Body** | `{ "id": string, "code": string, "password": string, "confirmPassword": string }` (`AuthResetPasswordRequest`) — `id` = id del alumno de la sesión |
| **Respuesta 200** | `null` |
| **Errores** | `400` contraseñas no coinciden / código inválido, `401` sin sesión o código expirado/incorrecto |
| **Frontend** | `src/modules/auth/api/reset-password.api.ts`, página `src/modules/auth/pages/reset-password/ResetPasswordPage.tsx` |

---

## 4. Mi cuenta — `/students/me`

> Estado: **Pendiente**. El módulo `students` del backend maneja `/:studentId/...` (operado por empleados con RBAC). Los endpoints `/students/me` deben resolverse desde el **JWT de alumno** (el `studentId` del token) y NO requerir `authorize()`.

### 4.1 GET /students/me

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/students/me` |
| **Auth** | Sesión de alumno |
| **Respuesta 200** | `StudentResponse` (fuente: `src/interfaces/responses/student.response.ts`) |

```json
{
  "id": "uuid-alumno",
  "name": "María",
  "firstLastName": "González",
  "secondLastName": "Pérez",
  "dateOfBirth": "2012-05-14T00:00:00.000Z",
  "curp": "GOPM120514MDFNRR01",
  "enrollment": "LR-2026-0001",
  "avatar": "https://.../avatar.png",
  "observations": null,
  "isActive": true,
  "bloodType": "O+",
  "medicalNotes": null,
  "email": "alumno@colegiolear.com",
  "phoneNumber": "5551234567",
  "address": "Calle Falsa 123",
  "state": "Ciudad de México",
  "municipality": "Benito Juárez",
  "postalCode": "03900"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `bloodType` | enum | `"A+" \| "A-" \| "B+" \| "B-" \| "AB+" \| "AB-" \| "O+" \| "O-"` |
| `avatar` | string? | URL absoluta (helper `file-url.helper.ts`) |
| `dateOfBirth` | string | ISO |

**Frontend:** `src/modules/my-account/api/get-student-account.api.ts`

### 4.2 GET /students/me/allergies

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/students/me/allergies` |
| **Auth** | Sesión de alumno |
| **Respuesta 200** | `AllergyResponse[]` |

```json
[
  {
    "id": "uuid",
    "name": "Maní",
    "severity": "severe",
    "observations": "Evitar contacto",
    "studentId": "uuid-alumno"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `severity` | enum | `"mild" \| "moderate" \| "severe"` |

**Frontend:** `src/modules/my-account/api/get-student-allergies.api.ts`

### 4.3 GET /students/me/guardians

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/students/me/guardians` |
| **Auth** | Sesión de alumno |
| **Respuesta 200** | `StudentGuardianResponse[]` |

```json
[
  {
    "id": "uuid",
    "studentId": "uuid-alumno",
    "fullName": "Juan González",
    "relationship": "father",
    "phoneNumber": "5551234567",
    "email": "juan@example.com",
    "isPrincipal": true,
    "emergencyContact": true,
    "authorizedToPickUp": true,
    "observations": null
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `relationship` | enum | `"father" \| "mother" \| "grandmother" \| "grandfather" \| "uncle" \| "aunt" \| "brother" \| "sister" \| "legal-guardian" \| "step-father" \| "step-mother" \| "other"` |

**Frontend:** `src/modules/my-account/api/get-student-guardians.api.ts`

### 4.4 POST /students/me/avatar

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/students/me/avatar` |
| **Auth** | Sesión de alumno |
| **Content-Type** | `multipart/form-data` |
| **Body** | Campo `file` (archivo de imagen) — el frontend usa `FormData` con `formData.append("file", file)` |
| **Respuesta 200** | `StudentResponse` (con `avatar` actualizado) |
| **Notas** | Reutilizar el servicio de storage existente (`src/shared/services/storage.service.ts`) y el middleware `require-multipart` si aplica |
| **Frontend** | `src/modules/my-account/api/update-student-avatar.api.ts` |

---

## 5. Inscripciones — `/students/:studentId/enrollments`

### 5.1 GET /students/:studentId/enrollments

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/students/:studentId/enrollments` |
| **Auth** | Sesión de empleado con `authorize("students")` |
| **Params** | `studentId` (UUID) |
| **Respuesta 200** | Lista de inscripciones del alumno (incluye `student`, `academicCycle`, `academicCycleSchoolGroup`, `scholarship`) |
| **Estado** | **Existe** — `findAllForStudent` en `src/modules/academic-cycles/academic-cycle-enrollment.controller.ts` (montado en `student.routes.ts`) |
| **Notas** | El portal alumno no lo consume directamente (las inscripciones llegan en `AuthResponse`), pero es la fuente de datos del selector de inscripción del navbar |

---

## 6. Calificaciones — `/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades`

### 6.1 GET .../grades

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades` |
| **Auth** | Sesión (hoy: empleado con `authorize("academic-cycles")`; ver nota) |
| **Params** | `academicCycleId` (UUID), `academicCycleEnrollmentId` (UUID) |
| **Query** | — |
| **Respuesta 200** | `StudentGradeResponse[]` |

```json
[
  {
    "id": "uuid",
    "grade": 8.5,
    "evaluationNumber": 1,
    "schoolSubjectId": "uuid-materia",
    "schoolSubject": { "id": "uuid-materia", "name": "Matemáticas", "description": null },
    "academicCycleEnrollmentId": "uuid-inscripcion"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `grade` | number | Decimal, el frontend lo muestra como número |
| `evaluationNumber` | int | 1..`evaluationCount` del ciclo |

- Orden actual del backend: por `schoolSubjectId` asc, luego `evaluationNumber` asc.
- El frontend agrupa por materia y calcula promedios (usa `minimumPassingGrade` y `evaluationCount` del ciclo).
- **Estado** | **Existe** — `student-grade.*` en `src/modules/academic-cycles/`.
- **Nota de acceso**: hoy está bajo RBAC de empleados. Para el portal alumno se debe validar que el JWT de alumno corresponda a la inscripción (`academicCycleEnrollmentId` debe pertenecer al `studentId` del token) devolviendo 404 si no.

**Frontend:** `src/modules/dashboard/api/get-student-grades.api.ts`

---

## 7. Cartera — `/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet`

### 7.1 GET .../wallet

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet` |
| **Params** | `academicCycleId`, `academicCycleEnrollmentId` (UUID) |
| **Respuesta 200** | `StudentWalletResponse` |

```json
{
  "summary": { "total": 18000, "outstanding": 6000, "paid": 12000, "overdue": 3000 },
  "items": [
    {
      "id": "uuid-item",
      "name": "Colegiatura",
      "code": "COL-01",
      "dueDate": "2026-09-10T00:00:00.000Z",
      "description": "Pago mensual",
      "amount": 3000,
      "allowForgiveness": true,
      "outstandingAmount": 3000,
      "isForgiven": false,
      "extensionDate": null,
      "status": "pending",
      "academicCycleEnrollmentId": "uuid-inscripcion",
      "academicCycleId": "uuid-ciclo",
      "studentId": "uuid-alumno",
      "academicCycleWalletId": "uuid-concepto"
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `summary.total/outstanding/paid/overdue` | number | Montos en MXN |
| `items[].status` | enum | `"pending" \| "paid" \| "overdue" \| "forgiven"` |

- **Estado** | **Existe** — `student-wallet.*` en `src/modules/academic-cycles/`. Misma nota de acceso por JWT de alumno que en calificaciones.

**Frontend:** `src/modules/dashboard/api/get-student-wallet.api.ts`

### 7.2 GET .../wallet/payments

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/payments` |
| **Params** | `academicCycleId`, `academicCycleEnrollmentId` (UUID) |
| **Query** | — |
| **Respuesta 200** | `StudentWalletPaymentResponse[]` |

```json
[
  {
    "id": "uuid",
    "folio": "FOL-0001",
    "amount": 3000,
    "createAt": "2026-09-10T14:30:00.000Z",
    "paymentMethod": "cash",
    "academicCycleId": "uuid-ciclo",
    "academicCycleEnrollmentId": "uuid-inscripcion",
    "studentWalletItemId": "uuid-item"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `paymentMethod` | enum | `"cash" \| "online-payment" \| "forgiven"` |
| `createAt` | string | Ojo: el contrato usa `createAt` (sin `d`), tal como está en el frontend |

- **Estado** | **Existe** — `student-wallet.*` en `src/modules/academic-cycles/`.

**Frontend:** `src/modules/student-wallet/api/get-student-wallet-payments.api.ts`

---

## 8. Horario y docentes — `/academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId`

### 8.1 GET .../calendars

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/calendars` |
| **Params** | `academicCycleId`, `academicCycleSchoolGroupId` (UUID) |
| **Respuesta 200** | `AcademicCycleSchoolGroupCalendarResponse[]` |

```json
[
  {
    "id": "uuid",
    "day": "monday",
    "startTime": "08:00:00",
    "endTime": "09:00:00",
    "academicCycleId": "uuid-ciclo",
    "academicCycleSchoolGroupId": "uuid-grupo",
    "academicCycleSchoolSubjectId": "uuid-materia-ciclo",
    "schoolSubjectId": "uuid-materia",
    "schoolSubject": { "id": "uuid-materia", "name": "Matemáticas", "description": null },
    "teacherId": "uuid-docente",
    "teacher": { "id": "uuid-docente", "name": "Ana", "firstLastName": "Torres", "secondLastName": "López", "email": "ana@colegiolear.com", "phoneNumber": "555...", "username": "atorres", "mustChangePassword": false, "jobTitleId": "uuid-puesto" }
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `day` | enum | `"monday" \| "tuesday" \| "wednesday" \| "thursday" \| "friday" \| "saturday" \| "sunday"` |
| `startTime/endTime` | string | `HH:mm:ss` |

- **Estado** | **Existe** — `academic-cycle-school-group.*` en `src/modules/academic-cycles/`. Misma nota de acceso por JWT de alumno (validar que el grupo pertenezca a una inscripción del alumno).

**Frontend:** `src/modules/calendar/api/get-calendars-for-academic-cycle-school-group.api.ts`

### 8.2 GET .../teachers

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/teachers` |
| **Params** | `academicCycleId`, `academicCycleSchoolGroupId` (UUID) |
| **Respuesta 200** | `AcademicCycleSchoolGroupTeacherResponse[]` (pares materia-ciclo + docente) |

```json
[
  {
    "academicCycleSchoolSubjectId": "uuid-materia-ciclo",
    "schoolSubjectId": "uuid-materia",
    "schoolSubject": { "id": "uuid-materia", "name": "Matemáticas" },
    "teacherId": "uuid-docente",
    "teacher": { "id": "uuid-docente", "name": "Ana", "firstLastName": "Torres", ... }
  }
]
```

- **Estado** | **Existe** — `academic-cycle-school-group.*` en `src/modules/academic-cycles/`.

**Frontend:** `src/modules/dashboard/api/get-teachers-for-academic-cycle-school-group.api.ts`

---

## 9. Materias — tareas y materiales

> Estado: **Pendiente**. No existen modelos ni endpoints de tareas/materiales en el backend.
> Se requieren modelos Prisma nuevos, p. ej. `SchoolSubjectTask` y `SchoolSubjectMaterial`, ligados a `AcademicCycleSchoolSubject` (y al grupo para tareas), con adjuntos vía el módulo `attachments` existente (`relatedRecordId`).

### 9.1 GET /academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks` |
| **Params** | `academicCycleId`, `academicCycleSchoolGroupId`, `academicCycleSchoolSubjectId` (UUID) |
| **Query** | `page` (default 1), `pageSize` (default 5; el frontend envía `pageSize=5`) |
| **Respuesta 200** | `PagedResponse<SchoolSubjectTaskResponse>` |
| **Orden** | `createdAt` **descendente** (más reciente primero) |

```json
{
  "data": [
    {
      "id": "uuid",
      "academicCycleId": "uuid-ciclo",
      "academicCycleSchoolGroupId": "uuid-grupo",
      "academicCycleSchoolSubjectId": "uuid-materia-ciclo",
      "title": "Resolución de problemas",
      "description": "Resolver ejercicios 1-10",
      "dueDate": "2026-09-15T00:00:00.000Z",
      "createdAt": "2026-09-10T10:00:00.000Z",
      "attachments": [
        {
          "id": "uuid",
          "url": "https://.../archivo.pdf",
          "name": "ejercicios.pdf",
          "extension": "pdf",
          "relatedRecordId": "uuid-tarea"
        }
      ]
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "itemsCount": 1
}
```

- `attachments[].relatedRecordId` = id de la tarea.
- **Frontend:** `src/modules/subjects/api/get-school-subject-tasks.api.ts` (constante `SCHOOL_SUBJECT_TASKS_PAGE_SIZE = 5`).

### 9.2 GET /academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/materials

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/materials` |
| **Params** | `academicCycleId`, `academicCycleSchoolGroupId`, `academicCycleSchoolSubjectId` (UUID) |
| **Query** | — |
| **Respuesta 200** | `SchoolSubjectMaterialResponse[]` |

```json
[
  {
    "id": "uuid",
    "academicCycleId": "uuid-ciclo",
    "academicCycleSchoolGroupId": "uuid-grupo",
    "academicCycleSchoolSubjectId": "uuid-materia-ciclo",
    "attachment": {
      "id": "uuid",
      "url": "https://.../material.pdf",
      "name": "material.pdf",
      "extension": "pdf",
      "relatedRecordId": "uuid-material"
    }
  }
]
```

- Cada material tiene exactamente **un** adjunto (`attachment.relatedRecordId` = id del material).
- **Frontend:** `src/modules/subjects/api/get-school-subject-materials.api.ts`

---

## 10. Chats — `/students/:studentId/enrollments/:enrollmentId/chats`

> Estado: **Pendiente**. No existe ningún módulo de chats en el backend.
> Se requieren modelos Prisma nuevos (p. ej. `StudentChat`/`StudentChatMessage` ligados a la inscripción y al docente `Employee`), y notificaciones de tipo `message` para el alumno al recibir mensajes del docente (el campo `relatedRecordId` del contrato de notificaciones sería el id del chat).

### 10.1 GET /students/:studentId/enrollments/:enrollmentId/chats

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/students/:studentId/enrollments/:enrollmentId/chats` |
| **Params** | `studentId` (UUID), `enrollmentId` (UUID) |
| **Query** | — |
| **Respuesta 200** | `ChatResponse[]` — una conversación por docente que imparte clases al grupo de la inscripción |

```json
[
  {
    "enrollmentId": "uuid-inscripcion",
    "teacherId": "uuid-docente",
    "teacher": { "id": "uuid-docente", "name": "Ana", "firstLastName": "Torres", "secondLastName": "López", ... },
    "schoolSubject": { "id": "uuid-materia", "name": "Matemáticas", ... },
    "lastMessage": "Hola, ¿cómo vas con la tarea?",
    "lastMessageAt": "2026-09-10T12:00:00.000Z",
    "unreadCount": 2
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `teacherId` | string | Coincide con `chatId` de los mensajes; el frontend lo usa como identificador de la conversación |
| `lastMessage*`, `unreadCount` | opcionales | Previews para la lista |

- **Frontend:** `src/modules/chats/api/get-chats.api.ts`

### 10.2 GET /students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages` |
| **Params** | `studentId`, `enrollmentId`, `teacherId` (UUID) |
| **Query** | `page` (default 1), `pageSize` (default 20; el frontend envía `CHAT_PAGE_SIZE = 20`) |
| **Respuesta 200** | `PagedResponse<ChatMessageResponse>` |
| **Orden** | `sentAt` **ascendente** (los más viejos primero); la paginación recorre hacia atrás ("ver mensajes anteriores") — el frontend pagina desde el final del historial |

```json
{
  "data": [
    {
      "id": "uuid",
      "chatId": "uuid-docente",
      "sentBy": "student",
      "content": "Hola profe",
      "sentAt": "2026-09-10T11:00:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "itemsCount": 1
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `chatId` | string | Id del docente (identifica la conversación) |
| `sentBy` | enum | `"student" \| "teacher"` |

- **Frontend:** `src/modules/chats/api/get-chat-messages.api.ts`

### 10.3 POST /students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages` |
| **Params** | `studentId`, `enrollmentId`, `teacherId` (UUID) |
| **Body** | `{ "content": string }` (`SendChatMessageRequest`) |
| **Respuesta 201/200** | `ChatMessageResponse` (el mensaje creado, `sentBy: "student"`) |
| **Frontend** | `src/modules/chats/api/send-chat-message.api.ts` |

---

## 11. Asistencias — `/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists`

> Estado: **Pendiente**. No existe modelo de asistencias en el backend.
> Las asistencias se registran **por día** (no por materia). Se requiere un modelo Prisma nuevo, p. ej. `StudentAssist` con `academicCycleEnrollmentId`, `assistDate`, `status` (`present|absent`) y `absenceReason` (texto libre, nullable).

### 11.1 GET /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists` |
| **Params** | `academicCycleId`, `academicCycleEnrollmentId` (UUID) |
| **Query** | `page` (default 1), `pageSize` (default 10; el frontend envía `STUDENT_ASSISTS_PAGE_SIZE = 10`), `fromDate` (opcional, ISO o `YYYY-MM-DD`), `toDate` (opcional, ISO o `YYYY-MM-DD`) |
| **Respuesta 200** | `PagedResponse<StudentAssistResponse>` |
| **Filtros** | Rango de fechas **inclusive** (día a día sobre `assistDate`) |
| **Orden** | `assistDate` **descendente** (más reciente primero) |

```json
{
  "data": [
    {
      "id": "uuid",
      "academicCycleEnrollmentId": "uuid-inscripcion",
      "assistDate": "2026-09-10T00:00:00.000Z",
      "status": "absent",
      "absenceReason": "Cita médica"
    },
    {
      "id": "uuid",
      "academicCycleEnrollmentId": "uuid-inscripcion",
      "assistDate": "2026-09-09T00:00:00.000Z",
      "status": "present",
      "absenceReason": null
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "itemsCount": 2
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | enum | `"present" \| "absent"` |
| `absenceReason` | string \| null | Texto libre; `null` cuando `status = "present"` |

- **Nota de comportamiento esperado por el frontend:** si no se envían `fromDate`/`toDate`, el frontend manda por defecto el rango de la semana en curso; el backend no debe aplicar otro default implícito (o si lo hace, devolver el rango solicitado tal cual).
- **Frontend:** `src/modules/attendance/api/get-student-assists.api.ts`, filtro en `src/interfaces/filter/student-assist.filter.ts`.

---

## 12. Notificaciones — `/notifications/student/:studentId`

> Estado: **Parcial**. El backend tiene `GET /notifications/:type/:id` y `POST /notifications/:id/read`, pero:
> - `GET /notifications/student/:id` devuelve `400 "type 'student' is not implemented yet"` (el `:type` solo soporta `admin`).
> - `POST /notifications/:id/read` espera el id de la notificación como **path param**, mientras el portal alumno envía `notificationId` en el **body** con otra ruta.
> - El modelo `Notification` ya soporta `NotificationRecipientType.student` y la entrega programada (job existente).

### 12.1 GET /notifications/student/:studentId

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/notifications/student/:studentId` |
| **Params** | `studentId` (UUID) |
| **Query** | `page` (default 1; `pageSize` opcional — el frontend solo envía `page`) |
| **Respuesta 200** | `PagedResponse<NotificationResponse>` |

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Nuevo comunicado",
      "message": "Revisa el comunicado de la dirección",
      "type": "announcement",
      "relatedRecordId": "uuid-comunicado",
      "createdAt": "2026-09-10T09:00:00.000Z",
      "read": false
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "itemsCount": 1
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `type` | enum | `"info" \| "error" \| "announcement" \| "message"` |
| `relatedRecordId` | string | Id de la entidad relacionada: `announcement` → id del comunicado; `message` → id del chat |

- **Frontend:** `src/shared/components/navbar/api/get-paged-notifications.api.ts`

### 12.2 POST /notifications/student/:studentId/read

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/notifications/student/:studentId/read` |
| **Params** | `studentId` (UUID) |
| **Body** | `{ "notificationId": string }` |
| **Respuesta 200** | `null` (idempotente) |
| **Notas** | Si la notificación es de tipo `announcement`, incrementar `viewedCount` del comunicado (igual que la versión de empleados) |
| **Frontend** | `src/shared/components/navbar/api/mark-notification-as-read.api.ts` |

---

## 13. Comunicados — `/announcements/:id`

### 13.1 GET /announcements/:id

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/announcements/:id` |
| **Auth** | Sesión (hoy: empleado con `authorize("announcements")`; ver nota) |
| **Params** | `id` (UUID) |
| **Respuesta 200** | `AnnouncementResponse` |

```json
{
  "id": "uuid",
  "name": "Inicio de clases",
  "description": "Información general",
  "content": "Contenido completo del comunicado..."
}
```

- **Estado** | **Existe** — módulo `announcements`.
- **Nota de acceso**: para el portal alumno, solo se debe permitir ver comunicados de tipo `student` (audiencia `AUDIENCE_TYPES.student`) o al menos validar que el comunicado esté publicado (`status` de la vida útil de publicaciones). El id viene de una notificación del alumno (`relatedRecordId`).

**Frontend:** `src/shared/components/navbar/api/get-announcement-by-id.api.ts`

---

## 14. Notas de implementación (resumen)

### Modelos Prisma requeridos (nuevos)

| Modelo sugerido | Campos clave | Relaciones |
|---|---|---|
| `StudentAssist` | `academicCycleEnrollmentId`, `assistDate`, `status` (enum `present/absent`), `absenceReason?` | → `AcademicCycleEnrollment` |
| `StudentChatMessage` (o `StudentChat` + mensajes) | `academicCycleEnrollmentId`, `teacherId`, `sentBy` (enum `student/teacher`), `content`, `sentAt` | → `AcademicCycleEnrollment`, `Employee` |
| `SchoolSubjectTask` | `academicCycleSchoolSubjectId`, `academicCycleSchoolGroupId`, `title`, `description?`, `dueDate` | → `AcademicCycleSchoolSubject`, `AcademicCycleGroup`; adjuntos vía `attachments` |
| `SchoolSubjectMaterial` | `academicCycleSchoolSubjectId`, `academicCycleSchoolGroupId`, attachment | → `AcademicCycleSchoolSubject`, `AcademicCycleGroup`; adjunto vía `attachments` |

- Enums con `@map` en minúsculas (estilo del proyecto): `present`, `absent`, `student`, `teacher`.
- Nombres de migración: `YYYYMMDDHHMMSS_snake_case_descripcion` (14 dígitos).
- `Student` ya tiene `password` y `mustChangePassword`; falta el código de reset con expiración (análogo a `add_password_reset_code_to_employees`).

### Seguridad / acceso

- Crear middleware de autenticación de alumno (JWT con `studentId`) y montar los módulos del portal bajo él.
- Los endpoints de sub-recursos por inscripción (`grades`, `wallet`, `assists`, `chats`) deben verificar que la inscripción pertenezca al `studentId` del token (404 si no) — nunca confiar solo en los params de la URL.
- No reutilizar `authorize(<moduleKey>)` (RBAC de empleados) para el portal alumno.

### Convenciones a respetar

- Respuestas paginadas con `sendPaginatedSuccess` (contrato `PagedResponse`).
- Validación Zod en params/query/body (`validate` middleware).
- Docs OpenAPI por endpoint (jsdoc `@openapi`) como en los módulos existentes.
- Servicio de storage existente para el avatar y adjuntos.