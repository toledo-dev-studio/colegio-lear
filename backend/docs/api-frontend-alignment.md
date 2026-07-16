# Alineación Backend ↔ Front (status → isActive y afines)

## Contexto

El front (admin-web) fue reestructurado: sus interfaces se separaron en
`filters/`, `requests/` y `responses/` por módulo
(`frontend/admin-web/src/interfaces/{filters,requests,responses}/*.ts`), y en
ese rediseño el campo que el backend exponía como `status` pasó a llamarse
**`isActive`** en (casi) todos los módulos. El backend fue construido antes
de ese cambio y sigue usando `status` en Prisma, DTOs, filtros y Swagger.

Este documento es la guía para seguir alineando módulo por módulo, y el
registro de qué ya se hizo. Está pensado para que una sesión nueva (con o sin
memoria de las anteriores) pueda retomar exactamente donde se dejó.

## Cómo confirmar que un módulo necesita este cambio

1. Leer las 3 interfaces del front del módulo:
   `interfaces/filters/<modulo>.filter.ts`,
   `interfaces/requests/<modulo>.request.ts`,
   `interfaces/responses/<modulo>.response.ts`.
2. Leer la acción correspondiente en
   `frontend/admin-web/src/modules/<modulo>/actions/*.ts` para ver los
   **nombres exactos de query params** que se mandan (`params: {...}` en los
   `get*Action`) y el **body** que se manda en create/update
   (`create-update-*.action.ts`). Esto es más confiable que solo leer la
   interfaz, porque a veces la interfaz declara un campo que la acción no
   termina enviando, o viceversa.
3. Comparar contra el backend: `<modulo>.types.ts`, `<modulo>.schema.ts`,
   `<modulo>.service.ts`, `<modulo>.controller.ts`, `<modulo>.routes.ts`, y
   los bloques correspondientes en `src/shared/swagger.config.ts`.

## La receta (aplicar en este orden por módulo)

1. **`prisma/schema.prisma`**: renombrar el campo `status` → `isActive` en el
   modelo, agregando `@map("is_active")`.
2. **Migración nueva**: crear carpeta
   `prisma/migrations/<timestamp>_rename_<tabla>_status_to_is_active/` con
   `migration.sql`:
   ```sql
   ALTER TABLE core.<tabla> RENAME COLUMN status TO is_active;
   ```
   (Postgres actualiza automáticamente las vistas que dependan de esa
   columna, así que no hace falta tocar las vistas `v_*` aunque referencien
   `status` — ver sección "Vistas sin usar" abajo.)
3. **`prisma/seed.ts`**: renombrar `status: true` → `isActive: true` en los
   `create:` de ese modelo (cuidado: solo los de ese modelo, el archivo tiene
   `status: true` repetido para muchos modelos distintos).
4. **`<modulo>.types.ts`**: renombrar `status` → `isActive` en
   `*Filters`, `*Record`/`*Detail`/`*View`, `Update*Dto`. En `Create*Dto`
   **agregar** `isActive?: boolean` (no renombrar nada ahí, es nuevo).
5. **`<modulo>.schema.ts`** (Zod): renombrar el filtro `status` → `isActive`
   (sigue siendo `z.enum(["true","false"])` para query params). Agregar
   `isActive: z.boolean().optional()` al schema de create. Renombrar
   `status` → `isActive` en el schema de update. Si hay bloques `@swagger`
   inline (algunos módulos documentan ahí en vez de en `routes.ts`),
   actualizarlos también.
6. **`<modulo>.service.ts`**:
   - `buildWhereClause`: renombrar el filtro.
   - Todos los mapeos manuales de fila → DTO (`toRecord`, `mapToXxx`, objetos
     literales inline): renombrar `status` → `isActive`.
   - `create()`: cambiar `status: true` fijo por `isActive: dto.isActive ?? true`.
   - `update()`: si arma un `updateData` a mano, renombrar `dto.status` →
     `dto.isActive`. Si hace `data: dto` directo (pasa el DTO completo a
     Prisma), no hace falta tocar nada ahí — el rename se propaga solo.
7. **`<modulo>.controller.ts`**: renombrar en `buildFilters`
   (`query.status` → `query.isActive`).
8. **`<modulo>.routes.ts`**: renombrar `name: status` → `name: isActive` en
   los bloques `@openapi` de query params, y las descripciones que
   mencionen "status"/"active/inactive". **Ojo con las descripciones de
   softDelete**: casi todos los módulos tienen ahí un texto viejo que dice
   "Sets the X status to false" y "X is already inactive" — el código real
   usa `isDeleted: true` y el mensaje real de `ConflictError` suele ser
   "X is already deleted". Corregir el texto para que coincida con el
   comportamiento real (ver "Bugs recurrentes" abajo).
9. **`src/shared/swagger.config.ts`**: renombrar `status` → `isActive` en el
   schema del módulo (List/Detail, CreateXDto, UpdateXDto), y también en
   cualquier copia **embebida** dentro de otros módulos (ej. `Employee`
   embebe una copia inline de `securityRole`/`jobTitle` con su propio
   `status`).
10. **`<modulo>.test.ts`** (si existe): renombrar todo `status` → `isActive`
    en mocks y assertions. Revisar también los "bugs recurrentes" de abajo,
    porque casi siempre aparecen ahí.
11. **Migrar y verificar**:
    ```bash
    npx prisma migrate deploy
    npx prisma generate
    npx prisma db seed
    npx tsc --noEmit          # solo deben quedar los 2 errores preexistentes de audit.middleware.ts
    npx vitest run src/modules/<modulo>/<modulo>.test.ts   # si existe
    ```
12. **Prueba en vivo** (docker db ya debe estar corriendo):
    ```bash
    pnpm run dev &
    # login
    curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"aone","password":"Admin123!"}'
    # probar GET con filtro isActive, POST con isActive:false, PATCH a isActive:true, DELETE
    ```
    Confirmar que la respuesta no tenga campos que no deberían salir
    (`password`, `isDeleted`, etc. — ver bug de leaks abajo).
13. Detener el server de prueba (`pkill -f "ts-node-dev.*src/index.ts"`).
14. Dar el **texto del commit** (nunca correr `git commit` — el usuario sube
    los cambios él mismo, quiere revisar el diff antes).

## Bugs recurrentes a revisar en cada módulo (no son parte del rename, pero aparecen seguido)

Estos bugs existían **antes** de este trabajo de alineación, no los causa el
rename — pero como se tocan los mismos archivos, conviene revisarlos y
arreglarlos de una vez:

- **`isDeleted` faltante en tests**: `buildWhereClause` siempre agrega
  `{ isDeleted: false }` al where base, pero varios tests esperaban
  `where: {}`. Hay que agregar `isDeleted: false` a los `where` esperados en
  los tests de `findAll`/`findAllPaged`.
- **`softDelete` desalineado**: varios tests de `softDelete` seguían
  probando un `status: false` viejo con mensaje "already inactive", cuando
  el código real hace `isDeleted: true` con mensaje "already deleted". Hay
  que corregir el test (no el código — el código está bien).
- **Leaks de campos por `include`/cast en vez de `select`**: algunos
  services usan `include: {...}` o casts (`as unknown as X`) en vez de un
  `select` explícito, lo que devuelve TODOS los campos escalares del modelo
  aunque el tipo de respuesta no los declare. Encontrado en:
  - `employees`: filtraba el **hash de password**, `isDeleted` y
    `mustChangePassword` en `GET /employees` (bug de seguridad real, ya
    arreglado).
  - `school-subjects`: filtraba `isDeleted` en varias respuestas (ya
    arreglado).
  - `announcements`: filtraba `isDeleted` en todas las respuestas (ya
    arreglado).
  Revisar cualquier `include`/cast sin `select` explícito en el service del
  módulo que sigue.
- **Forma de un campo no coincide, no solo el nombre**: no asumir que el
  rename es 1:1. `announcements.audience` es el ejemplo más grave hasta
  ahora: el backend validaba/guardaba `[{key, label}]` (array de objetos)
  pero el front solo maneja `string[]` (`["teacher","student"]`) — el
  `label` es puramente un catálogo estático del lado del cliente
  (`AUDIENCE_TYPES`), nunca se envía. Esto rompía **toda** creación/edición
  de comunicados con 400. Se resolvió simplificando el backend a
  `string[]` (confirmado con el usuario antes de tocar el schema de Prisma,
  ya que cambia la forma persistida en la columna `Json`). Al tocar un
  módulo nuevo, comparar la forma completa del campo (no solo su nombre)
  entre `interfaces/requests/*.ts` y lo que el backend persiste/valida.
- **Nombres de query param que no matchean**: no asumir que solo cambia
  `status`→`isActive`. Ya aparecieron: `employees` (`name`→`fullName`,
  `roleId`→`securityRoleId`), `academic-levels` (el sub-recurso
  `education-levels/paged` ni siquiera tenía soporte para el filtro `name`
  que el front ya mandaba). Siempre diffear contra el `params:{...}` real
  de la acción del front, no solo contra la interfaz.
- **Enums con casing distinto filtrándose crudos**: `job-titles` usa
  `administrative_staff` (guion bajo) en Prisma pero
  `administrative-staff` (guion) en el front. Cuando otro módulo embebe un
  `jobTitle` sin pasar por el mapeo `toFrontendJobTitleType`, se filtra el
  valor crudo de Prisma. Revisar si el módulo nuevo embebe `jobTitle`.
- **Orden de rutas en Express**: rutas estáticas (`/teachers`, `/me`, etc.)
  deben registrarse **antes** que `/:id`, si no Express las intercepta como
  si fueran un id. Encontrado en `employees` (`GET /employees/teachers`
  nunca respondía).

## Patrón de sincronización de arreglos 1:N (id con prefijo "new")

Cuando un formulario del front maneja una lista 1:N completa dentro de un
mismo `PATCH` (en vez de endpoints propios como `attachments`), el id de
cada elemento indica la operación: si el id empieza con el prefijo "new"
→ crear; si es un UUID existente → actualizar; si un id existente ya no
viene en el arreglo recibido → eliminar (delete de los que faltan).

**Ojo: el prefijo exacto no es uniforme en todo el front.** Hay al menos
dos generadores distintos de id temporal:

- `AcademicLevelForm.tsx` arma el id a mano: `` `new-${n}` `` (**guion**).
  Ya implementado así en `academic-level.service.ts`
  (`el.id.startsWith("new-")`).
- `generateTemporalId()` (`lib/extensions/utils.ts`) genera
  `` `new_${timestamp}_${random}` `` (**guion bajo**). Se usa en
  `CalendarFormPanel.tsx` para el campo `calendars` dentro de
  `AcademicCycleSchoolGroupRequest` (horarios de un grupo escolar) — este
  es el próximo caso real de este patrón, pendiente en `academic-cycles`.

Antes de implementar el sync en un módulo nuevo, **verificar el prefijo
real** que genera el componente del front para ese campo específico (grep
por `generateTemporalId\|"new-"` en el módulo correspondiente) — no asumir
que es el mismo que en `academic-levels`.

**Dónde NO aplica** (confirmado): `announcements.attachments`,
`students.guardians`, `students` info médica/alergias — todos estos ya
tienen sus propios endpoints dedicados (crear/listar/eliminar por
separado, atados al id del padre), igual que `attachments`. No se manejan
como arreglo sincronizado.

## Vistas sin usar (`v_school_subjects`, `v_academic_levels`)

Existen como vistas de Postgres definidas en la migración inicial, y como
modelos `view` en `schema.prisma`, pero **no se usan en ningún lado del
código** (confirmado por grep). Los renames de columna no las rompen
(Postgres seguirá resolviendo la vista contra la columna renombrada), así
que no hace falta tocarlas. Si en algún momento se detecta que sí se usan,
avisar antes de asumir que siguen bien.

## Entorno para pruebas en vivo

- DB por Docker: `docker compose up -d colegio-lear-db` (ver
  `compose.yaml` en la raíz). Credenciales `postgres`/`postgres`, DB
  `colegio_lear`.
- `backend/.env` ya está configurado correctamente (`DATABASE_URL` con las
  credenciales del contenedor). Falta que el usuario agregue
  `MAIL_USER`/`MAIL_PASSWORD` si quiere probar envío de correos — no
  bloquea nada más.
- Login de prueba: `aone` / `Admin123!` (SuperAdmin, permisos completos).
- `pnpm run dev` levanta el server en `http://localhost:3000`.

## `students` — trabajo en progreso, por secciones

Este módulo se está alineando por partes (así lo pidió el usuario, es grande):
sección 1 = `student` núcleo (hecho), sección 2 = `student-guardian`
(**hecho**, ver abajo), sección 3 = alergias (**hecho**, ver abajo),
sección 4 = wallet del alumno (`student-wallet-item`,
`student-wallet-payment`) — sin analizar todavía, probablemente se cruza
con `payment-concepts`/`academic-cycles`.

**Sección 2 (`student-guardian`) — completada.** Los nombres de campo,
rutas y valores del enum `relationship` ya coincidían 1:1 con el front (no
hubo que renombrar nada) — **pero probando en vivo apareció un bug real**:
`relationship: "legal-guardian"` (y `"step-father"`/`"step-mother"`)
tronaban con 500 (`PrismaClientValidationError`). Mismo problema que
`JobTitleType` en `employees`: el enum de Prisma
(`StudentGuardianType`) usa guion bajo en el nombre del miembro
(`legal_guardian`) pero `@map` lo guarda como `"legal-guardian"` (guion) en
la base — y el service pasaba el valor crudo del front (`dto.relationship
as never`) directo a Prisma sin traducir. Se agregó `GUARDIAN_TYPE_MAP` /
`GUARDIAN_TYPE_REVERSE` en `student-guardian.service.ts` (mismo patrón que
`BLOOD_TYPE_MAP` en `student.service.ts` y `toPrismaJobTitleType` en
`job-title.service.ts`), usado en `create()`, `update()`, y `toRecord()`.
Probado en vivo con los 3 valores que tienen guion (antes fallaban) más
`PATCH` y la lógica de "un solo tutor principal" (ya existía, sigue bien).
**Regla general para lo que sigue**: cualquier enum de Prisma con `@map` a
un valor con guion (`-`) es sospechoso — buscar si el service pasa el
valor del DTO directo sin traducir antes de asumir que un módulo con
enums está bien solo porque los nombres de campo coinciden.

**Sección 1 (`student` núcleo) — completada** en la migración
`20260713080000_student_medical_info_and_is_active`:

- `status` → `isActive`, filtro `name` → `fullName` (mismo patrón de
  siempre).
- **Cambio de arquitectura confirmado con el usuario**: el front espera
  `bloodType` (requerido) y `medicalNotes` como campos planos del alumno
  en `POST/PATCH/GET /students`, no anidados. El backend los tenía en una
  entidad separada `StudentMedicalInformation` (1:1, campo llamado
  `emergencyNotes`). Se eliminó `StudentMedicalInformation` por completo:
  `bloodType`/`medicalNotes` ahora son columnas directas en `students`, y
  `StudentAllergy` pasó a depender de `studentId` directo (antes
  `medicalInformationId`), coincidiendo con la ruta que el front ya usa:
  `/students/:studentId/allergies`. Se borraron los 4 archivos de
  `student-medical-information.*` y sus 2 rutas.
- El mapeo `BloodType` (Prisma usa `A_POSITIVE`, DB/API usan `"A+"`) se
  conservó tal cual estaba en el service viejo, reutilizado en
  `student.service.ts`.
**Sección 3 (alergias) — completada**, módulo nuevo `student-allergy.*`
(no existía nada antes, se construyó desde cero — ver más abajo por qué):

- Antes de construir, se aclaró con el usuario si hacía falta el algoritmo
  de sync tipo "new-" (comparar arreglo recibido contra existentes y
  borrar los que faltan, como `educationLevels`). **No hacía falta**: el
  front ya llama endpoints dedicados por registro
  (`GET/POST/PATCH/DELETE /students/:studentId/allergies`), un alergia a
  la vez — el `id === "new"` en `create-update-allergy-for-student.action.ts`
  es solo el mismo check de "¿formulario de crear o editar?" que usan
  todos los demás módulos, no el patrón de prefijo `new-`/`new_` de sync
  masivo. Antes de asumir que un campo 1:N necesita el algoritmo de sync,
  hay que revisar si el front realmente manda el arreglo completo en un
  solo PATCH (sí lo necesita) o si llama un endpoint por registro (no lo
  necesita, como aquí, como `attachments`, y como `student-guardian`).
- Módulo nuevo `student-allergy.types.ts` / `.schema.ts` / `.service.ts` /
  `.controller.ts`, mismo patrón que `student-guardian.*` (verificación de
  que el `studentId` del alumno padre coincide antes de update/delete, sin
  soft delete — es hard delete real, igual que guardianes). Rutas
  conectadas en `student.routes.ts`. No requirió migración nueva (el
  esquema de `StudentAllergy.studentId` ya había quedado listo en la
  migración de la sección 1).
- Probado en vivo: crear 2 alergias para un alumno, listar, editar una sin
  afectar la otra, eliminar una, y confirmado que no se puede borrar una
  alergia usando el `studentId` de otro alumno (404, no cross-tenant leak).
- **Hallazgo, no es para nosotros**: `GET /students/:studentId/enrollments`
  también lo espera el front pero es del dominio de `academic-cycles`
  (inscripción alumno↔ciclo), no de `students`. Queda pendiente para
  cuando se aborde ese módulo.
- **Aviso del lado del front (no lo tocamos)**: varios action files de
  `students` tienen líneas `// REMOVE` que fuerzan el endpoint a un JSON
  falso sin importar el ambiente (`get-students`, `get-student-by-id`,
  `get-allergies-for-student`, `get-academic-cycle-enrollments-for-student`),
  o usan `VITE_ENVIRONMENT === "development"` en vez del patrón
  `"mockable"` del resto del proyecto. Probar desde el navegador no va a
  reflejar la API real hasta que el front limpie esas líneas — seguimos
  validando por `curl` contra la API real.

## `academic-cycles` — trabajo en progreso, por secciones

Igual que `students`, se está alineando por partes. Plan acordado con el
usuario: sección 1 = `academic-cycle` núcleo (**hecho**, ver abajo),
sección 2 = `academic-cycle-school-subject`, sección 3 =
`academic-cycle-wallet`, sección 4 = `academic-cycle-school-group` (+
calendarios + maestros — aquí sí aplica el patrón de sync `new_` de
`CalendarFormPanel.tsx`, ver arriba), sección 5 =
`academic-cycle-enrollment` (resuelve el hallazgo pendiente de
`GET /students/:studentId/enrollments`), sección 6 = `student-grades`,
sección 7 = `student-wallet` (cierra también la sección 4 pendiente de
`students`).

**Metodología confirmada con el usuario para este módulo**: la fuente de
verdad son las interfaces `filters`/`requests`/`responses` de TS y los
action files reales del front — los JSON mock/dummy solo se consultan como
último recurso o para validación final, no como primer paso.

**Sección 1 (`academic-cycle` núcleo) — completada** en la migración
`20260716000000_rename_academic_cycle_type_and_add_grade_fields`:

- El backend tenía el campo `type`, el front (filter/request/response +
  los 5 action files de `academic-cycles/actions/academic-cycles/`) espera
  `periodType` — mismo enum, solo el nombre cambiaba. Se renombró la
  columna (`type` → `period_type`) y se actualizó
  `types/schema/service/controller/routes/swagger.config.ts`. El mapeo
  existente `TYPE_TO_PRISMA`/`TYPE_FROM_PRISMA` (para
  `four-month-period` ↔ `four_month_period`, el único valor del enum con
  guion) se mantuvo intacto, solo se le cambió el nombre de campo que
  envuelve.
- El front tiene `minimumPassingGrade` y `evaluationCount` (enteros,
  1-10, requeridos en el formulario — `AcademicCycleTab.tsx`, usados
  también en las tablas de calificaciones de
  `academic-cycle-enrollment/components/`) que **no existían en la tabla**
  `academic_cycles`. Se agregaron como columnas nuevas
  (`minimum_passing_grade INT DEFAULT 6`, `evaluation_count INT DEFAULT 3`
  — mismos defaults que usa el form del front) y se validan con Zod
  (`z.number().int().min(1).max(10)`, requeridos en create, opcionales en
  update).
- El campo `description` existe en la tabla pero el front no lo usa en
  ningún lado (ni filter, ni request, ni response) — se dejó tal cual, no
  es un bug, solo queda sin exponer desde el front.
- Probado en vivo: create con `periodType` normal y con
  `four-month-period` (confirma que el mapeo de guion sigue funcionando
  después del rename), filtro por `periodType` (ambos casos), PATCH de
  `minimumPassingGrade`/`evaluationCount`/`periodType`, y DELETE (cancela,
  no hay `isDeleted` en este modelo).

## Módulos ya alineados (8)

| Módulo | Migración | Notas |
|---|---|---|
| `security-roles` | `20260713000000_rename_security_role_status_to_is_active` | create/update ahora aceptan `isActive` (antes solo se tocaba vía DELETE) |
| `job-titles` | `20260713010000_rename_job_title_status_to_is_active` | — |
| `employees` | `20260713020000_rename_employee_status_to_is_active` | filtros renombrados (`name`→`fullName`, `roleId`→`securityRoleId`); fix leak de password/isDeleted (`EMPLOYEE_LIST_SELECT`); fix `jobTitleType` crudo; fix orden de ruta `/teachers` |
| `payment-concepts` | `20260713030000_rename_payment_concept_status_to_is_active` | fix tests de softDelete/isDeleted |
| `scholarships` | `20260713040000_rename_scholarship_status_to_is_active` | fix tests de softDelete/isDeleted |
| `school-subjects` | `20260713050000_rename_school_subject_status_to_is_active` | fix bug de compilación preexistente (TS1117, `include` duplicado); fix leak de `isDeleted` en findAll/findAllPaged/findById/create/update |
| `academic-levels` | `20260713060000_rename_academic_level_status_to_is_active` | fix filtro `name` faltante en `education-levels/paged`; fix tests de softDelete/isDeleted |
| `announcements` (+ `attachments`) | `20260713070000_rename_announcement_status_to_is_active` | fix breaking: `audience` pasó de `[{key,label}]` a `string[]` (confirmado con el usuario); fix leak de `isDeleted`; verificado el flujo completo de 2 fases (crear sin contenido/adjuntos → editar para agregar contenido + subir/borrar adjuntos, físico y en BD); `attachments` en sí ya estaba bien alineado, no necesitó cambios; storage local↔Azure ya está abstraído vía `IStorageService`, solo falta implementar `AzureStorageService` cuando se decida hacer el swap |

## Módulos pendientes (más complejos, sin tests todavía)

- `students` — secciones 1, 2 y 3 hechas (núcleo, `student-guardian`,
  alergias — ver detalle arriba). Falta sección 4 (wallet del alumno,
  `student-wallet-item`/`student-wallet-payment`), pospuesta a propósito
  hasta terminar `academic-cycles` porque depende de datos que se crean ahí.
- `academic-cycles` (+ sub-entidades: school-subject, wallet, school-group,
  enrollment) — en progreso por secciones, ver detalle abajo.

Ninguno tiene `*.test.ts` todavía y tienen relaciones más profundas — vale
la pena revisar si también usan `status`/`isActive` y si conviene generar
specs (tests) al mismo tiempo que se alinean, siguiendo el patrón de los
módulos que sí tenían tests (`academic-levels`, `payment-concepts`,
`scholarships`, `school-subjects`).
