# SERVICIOS MIS CLASES — Especificación de Endpoints Backend

> Documento de referencia para el desarrollo del backend del portal docente (`admin-web`, módulo `my-classes`).
> Describe **todos** los endpoints que el backend debe exponer para que el módulo "Mis clases" funcione en modo real (sin mocks).
> Fuente del contrato: archivos `api/*.ts`, `hooks/*` e `interfaces/*` de `frontend/admin-web` (módulo `my-classes`).

---

## 1. Estado general

| Estado | Significado |
|---|---|
| **Existe** | El endpoint ya está implementado en el backend y cumple el contrato |
| **Parcial** | Existe algo similar, pero no cumple el contrato exacto del módulo mis clases (se detalla en cada caso) |
| **Pendiente** | No existe en el backend; debe implementarse |

**Resumen:**

| Módulo | Endpoints | Estado |
|---|---|---|
| Mis clases (`/me/school-groups`) | 2 | Pendiente (no existe ningún `/me/school-groups` en el backend) |
| Tareas y adjuntos | 5 | Pendiente (existen variantes admin y alumno con otra forma de URL) |
| Materiales | 3 | Pendiente (ídem) |
| Calificaciones | 3 | Pendiente (existe por-inscripción; no por grupo/materia) |
| Asistencias por grupo | 2 | Pendiente (existe por-inscripción; no por grupo/día) |
| Inscripciones por grupo | 1 | Parcial (existe `enrollments/paged`, no el listado por grupo + status) |
| Chats docente | 2 | Parcial (mismos paths existen con `authenticateStudent`) |

---

## 2. Convenciones globales

### 2.1 Base URL y sesión

- Todos los endpoints se montan bajo el mismo origen del API (`app.use(...)` en `src/index.ts`), igual que los módulos existentes.
- Autenticación por **cookie HttpOnly `access_token`** (JWT de empleado), con fallback `Authorization: Bearer <token>`; el cliente axios de `admin-web` usa `withCredentials: true`.
- Respuesta `401` cuando el token falta, es inválido o expiró (el frontend limpia la sesión automáticamente al recibir 401, vía interceptor en `src/api/client.ts`).
- Los endpoints `/me/*` de mis clases deben resolverse desde el **JWT de empleado** (el `employeeId` del token, "docente autenticado") y validar que el docente está asignado a los recursos que consulta — nunca confiar solo en los params de la URL.
- Los endpoints de chat comparten path con el portal alumno (ver sección 9): requieren decidir el modo de autenticación (empleado y/o alumno) en el mismo endpoint.

### 2.2 Formato de respuestas

- Éxito simple (el frontend tipa la respuesta contra el contrato de cada endpoint):

```json
{ ...campos del recurso }
```

- Éxito paginado (contrato `PagedResponse<T>` de `frontend/admin-web/src/interfaces/responses/paged.response.ts`):

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

- Fechas con hora: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.mmmZ`), p. ej. `sentAt`, `createdAt`.
- Fechas de día (`assistDate`, `dueDate`): el frontend envía/compara solo `YYYY-MM-DD` (helper `toDayParam` = `slice(0, 10)` de `src/modules/my-classes/lib/attendance.lib.ts`); el backend debe hacer el filtro por día y no por timestamp.

### 2.5 Validación

- Zod, con el mismo estilo que los módulos existentes (`validate(schema, "body" | "query" | "params")`).
- Params UUID: `z.string().uuid()`.

---

## 3. Mis clases — `/me/school-groups`

> Estado: **Pendiente**. No existe ninguna ruta `/me/school-groups` en el backend.
> Debe resolverse desde el JWT de empleado: el docente solo ve los grupos a los que está asignado vía calendario (`AcademicCycleSchoolGroupCalendar.teacherId`).

### 3.1 GET /me/school-groups/paged

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/me/school-groups/paged` |
| **Auth** | Sesión de empleado (docente) |
| **Query** | `q` (opcional, texto libre), `name` (opcional, nombre del grupo), `status` (opcional: `active` \| `discharged`), `academicCycleStatus` (opcional: `upcoming` \| `active` \| `completed` \| `cancelled` \| `archived`), `page` (default 1), `pageSize` (default 10) |
| **Respuesta 200** | `PagedResponse<MyClassResponse>` |

```json
{
  "data": [
    {
      "id": "c1d4e9f6-7a8b-4e3f-d9c2-2e7a8d9f0b03",
      "name": "Primero A (2025-2026)",
      "status": "active",
      "academicCycle": {
        "id": "f5f6c5c7-7f7e-4bcb-a7a4-1c7e6f1d1003",
        "name": "2025 - 2026",
        "code": "2025-A",
        "periodType": "annual",
        "status": "active",
        "minimumPassingGrade": 6,
        "evaluationCount": 3,
        "startDate": "2025-08-18T00:00:00.000Z",
        "endDate": "2026-07-03T00:00:00.000Z"
      }
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "itemsCount": 1
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Id del `academicCycleSchoolGroup` (identifica la clase) |
| `status` | enum | `"active" \| "discharged"` |
| `academicCycle` | object? | Opcional; campos consumidos: `id`, `name`, `code`, `status`, `minimumPassingGrade`, `evaluationCount` |

- Filtros `name`, `status` y `academicCycleStatus` se envían opcionalmente; `q` es un texto de búsqueda libre.
- **Frontend:** `src/modules/my-classes/api/my-classes/get-paged-my-classes.api.ts`, filtro `src/interfaces/filters/my-class.filter.ts`.

### 3.2 GET /me/school-groups/:id

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/me/school-groups/:id` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `id` (UUID del grupo) |
| **Respuesta 200** | `MyClassResponse` (mismo contrato que 3.1) |
| **Errores** | `404` si el grupo no existe o no está asignado al docente |

- **Frontend:** `src/modules/my-classes/api/my-class/get-my-class-by-id.api.ts` — se usa en el layout de la clase (título, ciclo).

---

## 4. Materias — tareas y adjuntos

> Estado: **Pendiente**. El backend ya tiene tareas y adjuntos pero con otra forma de URL (admin: `/academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks` en `academic-cycle.routes.ts`; alumno: solo GET en `school-subject-task-student.routes.ts`).
> El contrato de mis clases usa **materia plana** (`schoolSubjectId`) en vez de `academicCycleSchoolSubjectId`, y resuelve el grupo desde el JWT del docente.
> Prefijo común: `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId` — `schoolGroupId` = `academicCycleSchoolGroupId`, `schoolSubjectId` = id de la materia.

### 4.1 GET /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId` (UUID), `schoolSubjectId` (UUID) |
| **Query** | — (sin paginación; el frontend trae la lista completa) |
| **Respuesta 200** | `SchoolSubjectTaskResponse[]` |

```json
[
  {
    "id": "d1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f01",
    "title": "Resolución de problemas con ecuaciones",
    "description": "Resolver los ejercicios 1 al 10 de la página 45 del libro de texto y entregarlos en hoja blanca.",
    "dueDate": "2025-12-10",
    "academicCycleSchoolGroupId": "c1d4e9f6-7a8b-4e3f-d9c2-2e7a8d9f0b03",
    "schoolSubjectId": "a1b2c3d4-e5f6-4a7b-8c9d-123456789001",
    "attachments": [
      {
        "id": "e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a01",
        "url": "https://.../ejercicios-ecuaciones.pdf",
        "name": "ejercicios-ecuaciones.pdf",
        "extension": "pdf",
        "relatedRecordId": "d1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f01"
      }
    ]
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `dueDate` | string? | `YYYY-MM-DD` |
| `attachments[].relatedRecordId` | string | Id de la tarea |
| `attachments[].url` | string | URL absoluta (helper `file-url.helper.ts`) |

- **Frontend:** `src/modules/my-classes/api/school-subjects-tab/get-school-subject-tasks.api.ts`.

### 4.2 POST /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId` (UUID) |
| **Body** | `{ "id"?: string, "title": string, "description"?: string, "dueDate"?: string }` — ver nota de upsert |
| **Respuesta 200** | `SchoolSubjectTaskResponse` (la tarea creada o actualizada) |
| **Errores** | `400` validación, `404` grupo/materia no asignados al docente |

- **Nota de upsert:** el frontend envía `id: "new"` para crear y un UUID real para actualizar. El backend debe **omitir/ignorar** `id` cuando es `"new"` (crear) y **actualizar** cuando viene un UUID (el body con `id` es opcional en el contrato del backend; nunca debe guardarse el string `"new"`).
- **Frontend:** `src/modules/my-classes/api/school-subjects-tab/create-update-school-subject-task.api.ts` (request `src/interfaces/requests/school-subject-task.request.ts`).

### 4.3 DELETE /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId

| Item | Detalle |
|---|---|
| **Método** | `DELETE` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId`, `taskId` (UUID) |
| **Respuesta** | `2xx` sin cuerpo (el frontend solo usa el estado HTTP) |
| **Errores** | `404` tarea no encontrada |

- **Frontend:** `src/modules/my-classes/api/school-subjects-tab/delete-school-subject-task-by-id.api.ts`.

### 4.4 POST /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId`, `taskId` (UUID) |
| **Content-Type** | `multipart/form-data` |
| **Body** | Campo `file` (archivo) — el frontend usa `FormData` con `formData.append("file", file)` |
| **Respuesta 200** | `AttachmentResponse` (con `relatedRecordId` = `taskId`) |
| **Notas** | Reutilizar el servicio de storage existente (`src/shared/services/storage.service.ts`) y el middleware `require-multipart`; limpieza de adjuntos huérfanos si la tarea se elimina |

- **Frontend:** `src/modules/my-classes/api/school-subjects-tab/upload-school-subject-task-attachment.api.ts`.

### 4.5 DELETE /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments/:attachmentId

| Item | Detalle |
|---|---|
| **Método** | `DELETE` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments/:attachmentId` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId`, `taskId`, `attachmentId` (UUID) |
| **Respuesta** | `2xx` sin cuerpo |
| **Notas** | Debe eliminar también el archivo del storage |

- **Frontend:** `src/modules/my-classes/api/school-subjects-tab/delete-school-subject-task-attachment-by-id.api.ts`.

---

## 5. Materias — materiales

> Estado: **Pendiente**. Igual que tareas: existe variante admin y alumno con otra forma de URL (`/academic-cycles/.../school-subjects/:academicCycleSchoolSubjectId/materials`).
> Cada material es exactamente **un** adjunto con metadatos adicionales (`relatedRecordId` = id del material).

### 5.1 GET /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId` (UUID) |
| **Query** | — |
| **Respuesta 200** | `SchoolSubjectMaterialResponse[]` |

```json
[
  {
    "id": "a5b6c7d8-9e0f-4a1b-8c2d-3e4f5a6b7c01",
    "url": "https://.../guia-ejercicios-matematicas.pdf",
    "name": "guia-ejercicios-matematicas.pdf",
    "extension": "pdf",
    "relatedRecordId": "a5b6c7d8-9e0f-4a1b-8c2d-3e4f5a6b7c01",
    "academicCycleSchoolGroupId": "c1d4e9f6-7a8b-4e3f-d9c2-2e7a8d9f0b03",
    "schoolSubjectId": "a1b2c3d4-e5f6-4a7b-8c9d-123456789001"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Id del material |
| `relatedRecordId` | string | Id del material (autoreferencia del adjunto) |

- **Frontend:** `src/modules/my-classes/api/school-subjects-tab/get-school-subject-materials.api.ts`.

### 5.2 POST /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId` (UUID) |
| **Content-Type** | `multipart/form-data` |
| **Body** | Campo `file` (archivo) |
| **Respuesta 200** | `SchoolSubjectMaterialResponse` (el material creado) |
| **Notas** | Mismo storage service + `require-multipart` que los adjuntos de tareas |

- **Frontend:** `src/modules/my-classes/api/school-subjects-tab/upload-school-subject-material.api.ts`.

### 5.3 DELETE /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials/:materialId

| Item | Detalle |
|---|---|
| **Método** | `DELETE` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials/:materialId` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId`, `materialId` (UUID) |
| **Respuesta** | `2xx` sin cuerpo |
| **Notas** | Debe eliminar también el archivo del storage |

- **Frontend:** `src/modules/my-classes/api/school-subjects-tab/delete-school-subject-material-by-id.api.ts`.

---

## 6. Calificaciones

> Estado: **Pendiente**. El backend tiene calificaciones por-inscripción (admin: `/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades` CRUD; alumno: GET). No existe el contrato por grupo/materia de mis clases.
> Una calificación por combinación `academicCycleEnrollmentId + evaluationNumber` (upsert idempotente).

### 6.1 GET /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId` (UUID) |
| **Query** | — |
| **Respuesta 200** | `StudentGradeResponse[]` (una por alumno/evaluación de la materia) |

```json
[
  {
    "id": "46ee02f5-6b59-49e8-b459-ccf7b916908f",
    "grade": 7.8,
    "evaluationNumber": 1,
    "schoolSubjectId": "a1b2c3d4-e5f6-4a7b-8c9d-123456789001",
    "schoolSubject": { "id": "a1b2c3d4-e5f6-4a7b-8c9d-123456789001", "name": "Matemáticas" },
    "academicCycleEnrollmentId": "b5d2a5c1-f5d3-41d9-b7d4-8f2c1e5b2345"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `grade` | number | Decimal |
| `evaluationNumber` | int | 1..`evaluationCount` del ciclo |
| `schoolSubject` | object? | Opcional |

- **Frontend:** `src/modules/my-classes/api/school-subject-grades/get-school-subject-grades.api.ts`.

### 6.2 PUT /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades

| Item | Detalle |
|---|---|
| **Método** | `PUT` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId` (UUID) |
| **Body** | `{ "academicCycleEnrollmentId": string, "evaluationNumber": number, "grade": number }` |
| **Respuesta 200** | `StudentGradeResponse` (la calificación creada o actualizada) |
| **Notas** | **Upsert idempotente**: si ya existe una calificación para `academicCycleEnrollmentId + evaluationNumber` de esa materia, se actualiza; si no, se crea. El frontend no conoce el id de la calificación al guardar |

- **Frontend:** `src/modules/my-classes/api/school-subject-grades/create-update-school-subject-grade.api.ts`.

### 6.3 DELETE /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades/:gradeId

| Item | Detalle |
|---|---|
| **Método** | `DELETE` |
| **Ruta** | `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades/:gradeId` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `schoolGroupId`, `schoolSubjectId`, `gradeId` (UUID) |
| **Respuesta** | `2xx` sin cuerpo |
| **Errores** | `404` calificación no encontrada |

- **Frontend:** `src/modules/my-classes/api/school-subject-grades/delete-school-subject-grade-by-id.api.ts`.

---

## 7. Asistencias por grupo

> Estado: **Pendiente**. El backend tiene asistencias **por inscripción** (`/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists` en admin y alumno), no por grupo/día como requiere mis clases.
> La asistencia se registra **por día** (no por materia): un registro por alumno inscrito por cada día.

### 7.1 GET /academic-cycles/:academicCycleId/school-groups/:schoolGroupId/assists

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/school-groups/:schoolGroupId/assists` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `academicCycleId`, `schoolGroupId` (UUID) |
| **Query** | `assistDate` (ISO o `YYYY-MM-DD`; el frontend siempre lo envía; filtro **por día**, comparando solo `YYYY-MM-DD`) |
| **Respuesta 200** | `StudentAssistResponse[]` — solo los registros del día indicado |

```json
[
  {
    "id": "uuid",
    "academicCycleEnrollmentId": "b5d2a5c1-f5d3-41d9-b7d4-8f2c1e5b2345",
    "assistDate": "2025-09-10T00:00:00.000Z",
    "status": "present",
    "absenceReason": null
  },
  {
    "id": "uuid",
    "academicCycleEnrollmentId": "c5e3b6d2-f5d3-41d9-b7d4-8f2c1e5b2346",
    "assistDate": "2025-09-10T00:00:00.000Z",
    "status": "absent",
    "absenceReason": "Cita médica"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | enum | `"present" \| "absent"` |
| `absenceReason` | string \| null | Texto libre; `null` cuando `status = "present"` |

- **Frontend:** `src/modules/my-classes/api/attendance-tab/get-school-group-assists.api.ts`.

### 7.2 POST /academic-cycles/:academicCycleId/school-groups/:schoolGroupId/assists

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/academic-cycles/:academicCycleId/school-groups/:schoolGroupId/assists` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `academicCycleId`, `schoolGroupId` (UUID) |
| **Body** | `{ "assistDate": string, "assists": [ { "academicCycleEnrollmentId": string, "status": "present" \| "absent", "absenceReason"?: string \| null } ] }` |
| **Respuesta 200** | `StudentAssistResponse[]` — los registros resultantes del día |
| **Notas** | **Upsert por alumno/día**: crea el registro si no existe para esa `academicCycleEnrollmentId + assistDate`; actualiza si existe |

- **Frontend:** `src/modules/my-classes/api/attendance-tab/create-update-school-group-assists.api.ts`.

---

## 8. Inscripciones por grupo

> Estado: **Parcial**. El backend tiene `GET /academic-cycles/:academicCycleId/enrollments/paged` (empleado, con su propio esquema de query), pero no cubre el listado no-paginado por grupo + status que usa mis clases para poblar la lista de alumnos (chats y calificaciones).

### 8.1 GET /academic-cycles/:academicCycleId/enrollments

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/academic-cycles/:academicCycleId/enrollments` |
| **Auth** | Sesión de empleado (docente) |
| **Params** | `academicCycleId` (UUID) |
| **Query** | `academicCycleSchoolGroupId` (UUID, requerido), `status` (opcional; el frontend envía `enrolled`) |
| **Respuesta 200** | `AcademicCycleEnrollmentResponse[]` — sin paginación, solo inscripciones del grupo con ese status |

```json
[
  {
    "id": "d4a1f2b8-6f6f-4b9d-a0e7-1d4a3d6e8c23",
    "code": "ENR-2026-007",
    "status": "enrolled",
    "observations": null,
    "studentId": "550e8400-e29b-41d4-a716-446655440007",
    "student": { "id": "550e8400-e29b-41d4-a716-446655440007", "name": "Santiago", "firstLastName": "Ortega", "secondLastName": "Flores" },
    "academicCycleId": "f5f6c5c7-7f7e-4bcb-a7a4-1c7e6f1d1003",
    "academicCycleSchoolGroupId": "c1d4e9f6-7a8b-4e3f-d9c2-2e7a8d9f0b03"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | enum | `"enrolled" \| "completed" \| "dropped"` (el frontend filtra `enrolled`) |
| `student` | object? | Campos consumidos: `id`, `name`, `firstLastName`, `secondLastName`, `avatar` |

- **Frontend:** `src/modules/my-classes/api/shared/get-academic-cycle-enrollments-by-school-group.api.ts` — usado por los tabs de chats y calificaciones.

---

## 9. Chats — `/students/:studentId/enrollments/:enrollmentId/chats`

> Estado: **Parcial**. Los paths **ya existen** en el backend (`src/modules/chats/chat.routes.ts`) pero protegidos con `authenticateStudent` y validando `studentId === req.student.studentId` (`chat.controller.ts`), es decir, pensados para el **portal alumno**.
> Mis clases (docente) usa exactamente los mismos paths. Se requiere:
> 1. Aceptar también sesión de **empleado/docente** (o un middleware dual) en `GET/POST .../messages`.
> 2. Con sesión de docente: validar que el docente imparte clases al grupo de la inscripción (calendario) — 404 si no.
> 3. `sentBy` debe ser `"teacher"` cuando envía el docente.
> Nota: el frontend de mis clases **no** consume `GET /students/:studentId/enrollments/:enrollmentId/chats` (lista de conversaciones); construye la lista de alumnos desde el endpoint 8.1.

### 9.1 GET /students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages

| Item | Detalle |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages` |
| **Auth** | Sesión de alumno (hoy) — **debe aceptar también sesión de docente** |
| **Params** | `studentId`, `enrollmentId`, `teacherId` (UUID) |
| **Query** | `page` (default 1), `pageSize` (default 20; el frontend envía `CHAT_PAGE_SIZE = 20`) |
| **Respuesta 200** | `PagedResponse<ChatMessageResponse>` |
| **Orden** | `sentAt` **ascendente**; la paginación recorre hacia atrás ("ver mensajes anteriores") — página 1 = mensajes más recientes |

```json
{
  "data": [
    {
      "id": "uuid",
      "chatId": "3bd0af8f-4431-4d0c-b671-1d940e65f768",
      "sentBy": "teacher",
      "content": "Hola, ¿cómo vas con la tarea?",
      "sentAt": "2026-09-10T12:00:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "itemsCount": 1
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `chatId` | string | Id del docente (`teacherId`); identifica la conversación |
| `sentBy` | enum | `"student" \| "teacher"` |

- **Frontend:** `src/modules/my-classes/api/chats-tab/get-chat-messages.api.ts` (refetch con polling de 30s).

### 9.2 POST /students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages

| Item | Detalle |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages` |
| **Auth** | Sesión de alumno (hoy) — **debe aceptar también sesión de docente** |
| **Params** | `studentId`, `enrollmentId`, `teacherId` (UUID) |
| **Body** | `{ "content": string }` (`SendChatMessageRequest`) |
| **Respuesta 200** | `ChatMessageResponse` (el mensaje creado; con sesión de docente, `sentBy: "teacher"`) |
| **Notas** | Con sesión de docente, `teacherId` debe coincidir con el docente autenticado; con sesión de alumno, `studentId` debe coincidir con el alumno autenticado |

- **Frontend:** `src/modules/my-classes/api/chats-tab/send-chat-message.api.ts`.

---

## 10. Notas de implementación (resumen)

### Rutas nuevas requeridas (prefijo `/me`)

| Ruta | Métodos |
|---|---|
| `/me/school-groups/paged` | GET |
| `/me/school-groups/:id` | GET |
| `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks` | GET, POST (upsert) |
| `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId` | DELETE |
| `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments` | POST (multipart) |
| `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments/:attachmentId` | DELETE |
| `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials` | GET, POST (multipart) |
| `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials/:materialId` | DELETE |
| `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades` | GET, PUT (upsert) |
| `/me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades/:gradeId` | DELETE |
| `/academic-cycles/:academicCycleId/school-groups/:schoolGroupId/assists` | GET (por día), POST (masivo upsert) |
| `/academic-cycles/:academicCycleId/enrollments` (listado por grupo + status) | GET |
| `/students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages` | GET, POST (ya existen; falta auth de docente) |

### Seguridad / acceso

- Crear middleware que resuelva el docente desde el JWT de empleado (patrón análogo a `authenticateStudent` + `/me` del portal alumno).
- Todos los endpoints `/me/school-groups/*` deben validar que el docente está asignado al grupo (`AcademicCycleSchoolGroupCalendar.teacherId`) y a la materia — 404 si no. Nunca confiar solo en los params de la URL.
- Para los chats: decidir el middleware dual (empleado/alumno) en los dos endpoints de mensajes y validar pertenencia según el tipo de sesión.
- No reutilizar `authorize(<moduleKey>)` (RBAC de admin) para los endpoints `/me/*`; el docente opera sobre sus propios recursos.

### Convenciones a respetar

- Respuestas paginadas con `sendPaginatedSuccess` (contrato `PagedResponse`).
- Validación Zod en params/query/body (`validate` middleware); params UUID con `z.string().uuid()`.
- Docs OpenAPI por endpoint (jsdoc `@openapi`) como en los módulos existentes.
- Servicio de storage existente para adjuntos de tareas y materiales; eliminar el archivo al borrar el registro.
- `multipart/form-data` con campo `file` (middleware `require-multipart` si aplica).
- El body de creación/actualización de tareas y el upsert de calificaciones/asistencias deben ser **idempotentes** (misma petición → mismo resultado), tal como los consume el frontend.