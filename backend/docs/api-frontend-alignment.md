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
  es el caso real de este patrón, ya implementado en
  `academic-cycle-school-group.service.ts` (sección 4 de `academic-cycles`).

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

## `students` — completo, alineado por secciones

Este módulo se alineó por partes (así lo pidió el usuario, es grande):
sección 1 = `student` núcleo (hecho), sección 2 = `student-guardian`
(**hecho**, ver abajo), sección 3 = alergias (**hecho**, ver abajo),
sección 4 = wallet del alumno (`student-wallet-item`,
`student-wallet-payment`) — **cerrada**, resultó ser exactamente la
misma cartera del alumno que se construyó como secciones 6/7 de
`academic-cycles` (mismas tablas, mismo servicio); no hizo falta código
adicional en `students`, solo confirmar que el hueco quedó cubierto. Ver
detalle completo en la sección de `academic-cycles` más abajo.

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
- **Hallazgo, no era para nosotros en ese momento**: `GET /students/:studentId/enrollments`
  también lo espera el front pero es del dominio de `academic-cycles`
  (inscripción alumno↔ciclo), no de `students`. Ya implementado —
  ver sección 5 de `academic-cycles` más abajo.
- **Aviso del lado del front (no lo tocamos)**: varios action files de
  `students` tienen líneas `// REMOVE` que fuerzan el endpoint a un JSON
  falso sin importar el ambiente (`get-students`, `get-student-by-id`,
  `get-allergies-for-student`, `get-academic-cycle-enrollments-for-student`),
  o usan `VITE_ENVIRONMENT === "development"` en vez del patrón
  `"mockable"` del resto del proyecto. Probar desde el navegador no va a
  reflejar la API real hasta que el front limpie esas líneas — seguimos
  validando por `curl` contra la API real.

## `academic-cycles` — completo, alineado por secciones

Igual que `students`, se está alineando por partes. Plan acordado con el
usuario: sección 1 = `academic-cycle` núcleo (**hecho**, ver abajo),
sección 2 = `academic-cycle-school-subject` (**hecho**, ver abajo),
sección 3 = `academic-cycle-wallet` (**hecho**, ver abajo), sección 4 =
`academic-cycle-school-group` (**hecho**, ver abajo; incluye calendarios +
maestros, aquí sí aplica el patrón de sync `new_` de
`CalendarFormPanel.tsx`), sección 5 = `academic-cycle-enrollment`
(**hecho**, ver abajo; resolvió el hallazgo pendiente de
`GET /students/:studentId/enrollments`), secciones 6 y 7 =
`student-grades` + `student-wallet` (**hecho**, ver abajo — resultaron
ser una sola pantalla del front, `AcademicCycleEnrollmentPage.tsx`, así
que se hicieron juntas; cierra también la sección 4 pendiente de
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

**Sección 3 (`academic-cycle-wallet`, "cartera de pagos") — completada**
en la migración
`20260716010000_academic_cycle_wallet_decouple_payment_concept`. Este fue
un cambio de arquitectura confirmado con el usuario, no solo un rename:

- El back modelaba `AcademicCycleWallet` con `paymentConceptId` como FK
  **obligatoria** a `PaymentConcept`, sin columnas propias de
  `name`/`description` (dependía del include para mostrarlas). Pero
  `AcademicCycleWalletPanelForm.tsx` (front) usa el concepto de pago
  **solo como plantilla de autollenado**: al buscarlo y seleccionarlo,
  copia `name`/`description`/`amount`/`allowForgiveness` a los campos del
  formulario, y el usuario puede editarlos libremente antes de guardar
  (ej. concepto "Inscripción" con base 1000, pero en un ciclo específico
  se ajusta a 800). El `create-update-academic-cycle-wallet-item.action.ts`
  **nunca envía `paymentConceptId`** al backend — confirmado con el
  usuario que es el diseño intencional, no un bug del front.
- Se desacopló la relación: se quitó `paymentConceptId` (columna y FK) de
  `academic_cycle_wallet`, se agregaron columnas propias `name`
  (`VARCHAR(100)`, requerido) y `description` (`VARCHAR(500)`, opcional).
  Cada item de cartera de un ciclo es ahora un snapshot independiente,
  totalmente editable, sin relación viva con `PaymentConcept` después de
  creado. La migración hace backfill de `name`/`description` desde el
  concepto relacionado antes de dropear la columna, por si había filas
  existentes (no las había en este momento, pero es correcto para
  cualquier ambiente con datos).
- Se quitó también el lado inverso de la relación
  (`PaymentConcept.academicCycleWallets`) del schema — ya no aplica.
- Probado en vivo: crear un item simulando el flujo real (nombre/monto
  "copiados" de un concepto e inmediatamente editados, ej. 1000 → 800),
  listar, PATCH de `amount`/`allowForgiveness`, DELETE. Nota operativa:
  durante la prueba el servidor de `pnpm run dev` tenía un proceso viejo
  que no había recogido el cliente de Prisma regenerado tras la migración
  (daba 500 genérico) — se reinició limpio y quedó confirmado que el
  código en sí estaba bien (se verificó llamando al service directamente
  con `ts-node` antes de asumir que había un bug real).

**Sección 2 (`academic-cycle-school-subject`) — validada, sin cambios.**
A diferencia de `academic-cycle-wallet` (sección 3), aquí sí es una
relación viva por FK: el front manda `schoolSubjectId` (no copia
name/description) tanto en request como en response, y el back ya lo
maneja así — `schoolSubjectId` obligatorio, valida duplicados
(`academicCycleId_schoolSubjectId` único, 409 si ya está asignada), y
devuelve el `schoolSubject` anidado (`id`/`name`/`description`) solo para
mostrar en el front. Nombres de campo, rutas y forma de la respuesta
coinciden 1:1 con `filter/request/response` y los 3 action files. No
hubo que tocar nada. Probado en vivo: crear, listar, intentar duplicado
(409 correcto), PATCH de `observations`, DELETE.

**Sección 4 (`academic-cycle-school-group` + calendarios + docentes) —
completada** en la migración `20260716020000_academic_cycle_school_group_calendars`.
Módulo construido desde cero (no existía nada en el back salvo un modelo
`AcademicCycleGroup` muy básico sin usar):

- **Aquí sí aplicó el algoritmo de sync `new_`/`new-`** documentado
  arriba: `AcademicCycleSchoolGroupForm.tsx` manda el arreglo completo de
  `calendars` dentro del mismo POST/PATCH del grupo
  (`CalendarFormPanel.tsx` genera el id con `generateTemporalId()` →
  prefijo `new_`). El service (`update()`) compara contra lo existente en
  una transacción: ids que ya no vienen → DELETE, ids nuevos
  (`new_`/`new-`/sin id) → CREATE, resto → UPDATE. Igual que
  `academic-level.service.ts` pero con Prisma `$transaction` porque acá sí
  hay create+update+delete mezclados en la misma operación.
- `status` pasó de `Boolean` a enum (`active`/`discharged`) porque así lo
  espera el front (`AcademicCycleSchoolGroupStatusKey`), y se agregó
  `dischargedDescription` (no existía). Se replicó en Zod la regla del
  front: si `status === "discharged"`, `dischargedDescription` es
  obligatorio (antes solo se validaba en el cliente).
- `AcademicCycleSchoolGroupCalendarResponse.startTime`/`endTime` son
  strings `"HH:mm"` (vienen de un `<input type="time">`, no ISO
  datetime). Se guardan como Postgres `TIME` (`@db.Time`) y se
  convierten a/desde `"HH:mm"` en el service — no había precedente de un
  campo tipo `TIME` puro en el proyecto.
- `AcademicCycleSchoolGroupTeacherResponse` (endpoint
  `GET .../teachers`) **no tiene tabla propia**: confirmado revisando el
  front que es una vista derivada de los pares distintos
  `(schoolSubjectId, teacherId)` dentro de los calendarios del grupo (se
  usa en la página de inscripciones, para saber qué docentes/materias
  tiene un grupo). El service arma esto en memoria a partir de
  `findMany` sobre calendarios, sin tabla ni endpoint separado de
  escritura. **Filtra solo docentes activos por default**
  (`teacher.isActive: true`), con `?includeInactive=true` opcional para
  ver el historial completo — pedido explícito del usuario, mismo
  criterio que ya aplicaba `GET /employees/teachers` (el que alimenta el
  dropdown de `CalendarFormPanel.tsx`, ya filtraba
  `isActive && jobTitleType === "teacher"` desde antes, confirmado que ya
  estaba bien documentado en swagger). `GET .../calendars` (el horario
  completo) **no** se filtra — ahí sí interesa ver la realidad del
  calendario aunque el docente asignado haya quedado inactivo.
- El campo `teacher` anidado reutiliza `EMPLOYEE_LIST_SELECT` +
  `toFrontendJobTitleType` de `employees`/`job-titles` (mismo whitelist
  que ya evita filtrar password/isDeleted, mismo fix de `jobTitleType`
  crudo que se hizo en `employees`).
- `academicCycleId`/`academicCycleSchoolGroupId` en cada entrada de
  `calendars` **se ignoran si vienen en el body** — se usan los de la URL
  (`:academicCycleId` y el id del grupo), mismo criterio que
  `academic-cycle-wallet`/`school-subject`: los params de ruta mandan
  sobre cualquier id que el front incluya en el cuerpo.
- `DELETE` es hard delete real (cascada a calendarios vía FK). A
  diferencia de `academic-cycle` (cuyo DELETE solo cancela), acá
  `status: "discharged"` ya es el camino de baja "suave" expuesto por
  PATCH normal del formulario — el botón de eliminar en el listado es un
  borrado real, consistente con el resto de sub-recursos dedicados
  (`school-subject`, `wallet`).
- Probado en vivo: crear grupo con 2 horarios iniciales, PATCH que en una
  sola llamada actualiza uno (nuevo horario), borra otro, y crea uno con
  id `new_...` (confirmado id nuevo real en la respuesta); `GET
  .../calendars`; `GET .../teachers` (pares distintos, confirmado que no
  duplica); validación de `startTime < endTime` (400); validación de
  `dischargedDescription` requerido con `status: "discharged"` (400 sin
  él, 200 con él); list sin `calendars` vs detail con `calendars`; DELETE
  real + cascada confirmada (404 después).

**Sección 5 (`academic-cycle-enrollment`) — completada** en la migración
`20260716030000_academic_cycle_enrollments`. Módulo nuevo desde cero:

- `code` (folio de la inscripción, ej. `INS-2026-0001`) es **distinto**
  de `student.enrollment` (ej. `LR-2026-0001`) — confirmado en el mock
  del front (`academic-cycles/enrollments/enrollments.json`, único caso
  en el que hizo falta mirar el mock, porque el campo `code` no traía
  ejemplo en las interfaces de TS y no aparece en el formulario de
  creación, solo se auto-genera y se muestra). Mismo algoritmo que
  `generateEnrollment()` de `student.service.ts`
  (`INS-<año>-<secuencial de 4 dígitos>`, secuencia reinicia por año),
  replicado como `generateCode()` en el nuevo service.
- Regla de negocio replicada del front al backend: el botón "Nueva
  inscripción" solo aparece si `academicCycle.enrollmentOpen === true` y
  `status` es `active` o `upcoming` (visto en
  `AcademicCycleEnrollmentsTab.tsx`). Se aplicó la misma regla en
  `create()` (409 si no se cumple) — **solo en create**, no en
  `update()`, porque cerrar la inscripción no debería impedir editar
  registros ya existentes (marcar como `completed`/`dropped` al cierre
  del ciclo, por ejemplo).
- `droppedNotes` obligatorio cuando `status === "dropped"`, mismo patrón
  que `dischargedDescription` en `school-group` (ya se ve en el form del
  front, se replicó la regla en Zod).
- Se valida que `academicCycleSchoolGroupId` pertenezca al mismo
  `academicCycleId` de la URL (404 si no), igual que el resto de
  sub-recursos anidados.
- **Resuelve el hallazgo pendiente de `students`**: se agregó
  `GET /students/:studentId/enrollments` (todas las inscripciones de un
  alumno a través de todos los ciclos) en `student.routes.ts`, importando
  el controller de `academic-cycles` directamente — es la única ruta que
  cruza dominios (URL vive en `students`, la lógica y la tabla son de
  `academic-cycles`).
- `DELETE` es hard delete real (el modal del front dice "se eliminará del
  sistema"). No se agregó ninguna restricción de unicidad
  estudiante+ciclo (ej. "no puede haber dos inscripciones activas del
  mismo alumno en el mismo ciclo") porque no hay evidencia de esa regla
  en el front — si se necesita, avisar antes de asumir.
- Probado en vivo: crear inscripción (código autogenerado correcto),
  listar paginado, buscar por `code` (`q`), `GET` por id, PATCH a
  `dropped` sin `droppedNotes` (400) y con él (200), cerrar
  `enrollmentOpen` del ciclo y confirmar que crear una nueva inscripción
  da 409 pero editar una existente sigue funcionando (200),
  `GET /students/:studentId/enrollments`, DELETE + confirmación 404.

**Secciones 6 y 7 (`student-grades` + `student-wallet`) — completadas**
en la migración `20260721000000_student_grades_and_wallet`. Se hicieron
juntas porque en el front son la misma pantalla
(`AcademicCycleEnrollmentPage.tsx`, el detalle de una inscripción) y
comparten el mismo contexto de estudio. Antes de escribir código se
confirmaron 2 decisiones de arquitectura con el usuario:

- **Calificaciones son 100% de solo lectura por ahora**: no existe
  ningún `create`/`update`/`delete` en el front, ni el módulo
  "my-classes" (docentes) que presumiblemente las generaría — solo es un
  permiso reservado (`moduleKey: "my-classes"`), sin pantallas. Se
  construyó únicamente `GET /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades`.
  No hay forma de cargar calificaciones reales hasta que exista esa
  pantalla — probado insertando un registro directo en la base para
  confirmar que el `GET` funciona.
- **`StudentWalletItem` no tiene create propio**: el front nunca lo
  crea, solo lo edita (condonación/prórroga) y paga contra él. Se generan
  automáticamente como snapshot de `academic-cycle-wallet` cuando el
  alumno se inscribe — se modificó `AcademicCycleEnrollmentService.create()`
  (sección 5) para, en la misma transacción, copiar cada item del catálogo
  del ciclo hacia `student_wallet_items` del alumno
  (`outstandingAmount` inicial = `amount`). Confirmado con el usuario
  antes de tocar código ya construido.
- **`status` del item (pending/paid/overdue/forgiven) se calcula en cada
  `GET`, no se persiste**: no hay ningún endpoint que lo actualice
  directamente ni evidencia de un cron en el front. Regla:
  `isForgiven` → `forgiven`; `outstandingAmount <= 0` → `paid`; hoy >
  (`extensionDate` ?? `dueDate`) → `overdue`; si no, `pending`.
- **Bug real encontrado y corregido en vivo**: mismo patrón de
  `@map()` con guion que ya nos había mordido con `StudentGuardianType`
  y `JobTitleType`, pero esta vez el error estaba en la migración, no en
  el service. El enum `PaymentMethod` (`online-payment`/`cash`) se creó
  en Postgres con guion bajo (`online_payment`) en vez de guion
  (`online-payment`), rompiendo la convención: Prisma siempre espera que
  el enum de la base de datos tenga como labels el valor de `@map()`
  (guion), y el cliente recibe/envía el nombre del miembro TS (guion
  bajo) — el mapeo `PAYMENT_METHOD_MAP`/`REVERSE` en el service ya
  estaba bien escrito desde el inicio, era la migración la que tenía las
  etiquetas de Postgres al revés. Se corrigió editando la migración
  directamente (no estaba comiteada todavía) y reaplicando.
- `folio` de pago = `PAG-<año>-<6 dígitos>` (distinto padding que
  `INS-`/`LR-`, que usan 4 — confirmado en el mock, único caso donde
  hizo falta consultarlo porque no había ejemplo en las interfaces TS).
- El campo `createAt` (no `createdAt`) en `StudentWalletPaymentResponse`
  es un typo real del front, no un error nuestro — se respetó tal cual
  en la respuesta del backend para que el front lo pueda leer.
- `isForgiven: true` requiere `allowForgiveness: true` (existente o en
  el mismo PATCH) — 409 si no. Al condonar, se pone
  `outstandingAmount = 0` en la misma operación, tal como lo describe el
  copy del propio formulario del front ("El pago pendiente quedará
  saldado cuando se active esta opción").
- Pagos: valida `amount <= outstandingAmount` (permite pagos parciales,
  igual que el front) y rechaza pagar un item que ya está `paid` o
  `forgiven` (409).
- `summary` (`total`/`paid`/`outstanding`/`overdue`) se calcula a partir
  de los items en cada `GET` de la cartera — no hay tabla ni columna
  propia. `paid` excluye los items condonados (condonar no es lo mismo
  que cobrar).
- Probado en vivo end-to-end: inscribir un alumno con 2 conceptos en el
  catálogo del ciclo → confirmar que se generó su cartera automática con
  los montos correctos y el `status` calculado bien (uno vencido por
  fecha pasada); pago parcial + pago restante (folio autogenerado,
  `online-payment` y `cash`); rechazo de pago a item ya saldado (409);
  rechazo de condonar un item con `allowForgiveness: false` (409);
  condonar uno válido y confirmar que salda el saldo; `GET` de
  calificaciones vacío y luego con un registro insertado directo en BD.

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

## Módulos completados por secciones (sin tests todavía)

- `students` — **completo**, las 4 secciones hechas (núcleo,
  `student-guardian`, alergias, y la sección 4 —wallet del alumno—
  cerrada indirectamente por las secciones 6/7 de `academic-cycles`, ver
  detalle abajo). Ver detalle arriba.
- `academic-cycles` — **completo**, las 7 secciones hechas (núcleo,
  school-subject, wallet, school-group + calendarios/maestros,
  enrollment, grades, student-wallet). Ver detalle abajo.

Ambos módulos quedaron sin `*.test.ts` — vale la pena generar specs ahora
que están completos, siguiendo el patrón de los módulos que sí tenían
tests (`academic-levels`, `payment-concepts`, `scholarships`,
`school-subjects`).

## Correcciones puntuales reportadas por el usuario (2026-07-21)

Lista de 8 bugs reportados; se validó cada uno antes de tocar código —
solo 3 eran del backend.

**Corregidos:**

1. `payment-concepts`: filtro `amount` en `payment-concept.service.ts`
   pasó de igualdad exacta a `{ lte: amount }` (monto máximo).
2. `scholarships`: filtro `discountPercentage` en
   `scholarship.service.ts` pasó de igualdad exacta a `{ lte: ... }`
   (porcentaje máximo).
3. `announcements`: el filtro de `publishedAt`/`expiresAt` comparaba
   cada campo contra un solo día exacto de forma independiente. Ahora
   ambos valores del filtro definen un solo rango de fechas
   (`publishedAt` = inicio del rango, `expiresAt` = fin del rango), y se
   exige que **tanto** el `publishedAt` **como** el `expiresAt` del
   registro caigan dentro de ese rango — no dos filtros de fecha exacta
   independientes. Confirmado con el usuario antes de implementar.

**Investigados y descartados (no son bugs del backend):**

4. `academic-levels` "sigue usando status" — no se reprodujo. Ya usa
   `isActive` en DB, service, schema, swagger y las interfaces del
   front. Probado en vivo.
5. `scholarships` "el export no aplica filtros" — el backend
   (`GET /scholarships`, sin paginar) sí aplica los filtros
   correctamente cuando se le mandan (probado en vivo). El bug está en
   el front: `ScholarshipsPage.tsx` → `handleClickExport` llama
   `mutations.scholarships.export.mutateAsync()` **sin argumentos**, o
   sea nunca manda `query`/`name`/`discountPercentage`/`isActive` al
   exportar. No es nuestro.
6. `announcements` "sigue usando status" — no se reprodujo, mismo caso
   que #4 (ya usa `isActive` en todos lados). Probado en vivo.
7. `my-account` / 8. `employees` "la imagen regresa null" — no se
   reprodujo en el backend. Probado subiendo una imagen real por
   `multipart/form-data` directo a `POST /employees`: el archivo se
   guardó en disco (`uploads/employees/<uuid>.png`) y el campo `image`
   regresó la ruta real, no `null`. El bug está en el front:
   `create-update-employee.action.ts` y `update-my-account.action.ts`
   arman un `FormData` (`fileFormData`) pero **nunca lo mandan como body
   de la petición** — lo anidan dentro de un objeto plano
   (`data: { ...employeeRequestLike, file: fileFormData }`), así que el
   request nunca sale como `multipart/form-data` y el middleware de
   multer del backend jamás recibe el archivo. El patrón correcto ya
   existe en el propio proyecto:
   `upload-attachment-for-announcement.action.ts` manda
   `data: formData` directo. No es nuestro, pero ahí está el fix exacto
   que le hace falta al front.

**Ajuste adicional pedido por el usuario**: como antes esto fallaba en
silencio (la petición "tenía éxito" pero `image` quedaba `null` sin
ningún error), se agregó `requireMultipart` (nuevo middleware en
`shared/middleware/require-multipart.middleware.ts`) en las 3 rutas de
`employees` que aceptan archivo (`POST /employees`, `PATCH /employees/:id`,
`PATCH /employees/me`) — rechaza con 400 explícito
("Content-Type must be multipart/form-data") cualquier request que no
venga como `multipart/form-data`, antes de que llegue a multer. **Efecto
colateral esperado y buscado**: como el front hoy nunca manda
multipart (ni siquiera en updates sin imagen, por el mismo bug de
`create-update-employee.action.ts`/`update-my-account.action.ts`),
**todas** las llamadas de creación/edición de empleados y "mi cuenta"
van a devolver 400 hasta que el front corrija el armado del `FormData`
— es intencional, para que el bug sea imposible de ignorar en vez de
fallar en silencio. Probado en vivo: JSON body → 400 con mensaje claro;
multipart real con imagen → 201, archivo guardado en disco, `image` con
ruta real.

## Rediseño de subida de avatar + rename image→avatar (2026-07-24)

El approach de la sección anterior (bloquear con 400 si la petición no
es multipart) se revirtió a favor de un diseño distinto: separar por
completo la subida de archivo de los endpoints de creación/edición.

**Motivación:** obligar a `POST /employees`, `PATCH /employees/:id` y
`PATCH /employees/me` a ser siempre `multipart/form-data` — incluso
cuando no hay archivo — es una carga innecesaria para el front. El
nuevo criterio: esas 3 rutas vuelven a ser JSON puro; el archivo solo
viaja hacia el backend cuando el usuario realmente selecciona uno, a
través de un endpoint dedicado.

**Cambios:**

1. Se quitó `requireMultipart` + `uploadSingle` (multer) de
   `POST /employees`, `PATCH /employees/:id` y `PATCH /employees/me`.
   Los tres vuelven a aceptar únicamente `application/json` y ya no
   reciben `file` en el body — `EmployeeService.create/update/updateMyAccount`
   perdieron el parámetro `file`.
2. Se agregaron 2 endpoints nuevos, ambos `multipart/form-data` con
   `file` obligatorio, dedicados exclusivamente a la imagen de perfil:
   - `POST /employees/:id/avatar` (requiere permiso `employees`) —
     `EmployeeService.uploadAvatar`.
   - `POST /employees/me/avatar` (sin RBAC, cualquier autenticado sobre
     sí mismo) — `EmployeeService.uploadMyAvatar`.
   Ambos borran el archivo anterior en `IStorageService` antes de subir
   el nuevo (evita huérfanos en `uploads/employees/`), y responden con
   el mismo shape que sus contrapartes de solo-datos (`EmployeeDetail` /
   `LoginResponse` respectivamente).
3. Rename de columna `image` → `avatar` en toda la base (motivo: el
   frontend ya usa `avatar` como nombre; no había ningún lugar donde el
   backend dijera `avatar` antes de este cambio, así que se unificó
   hacia ese nombre en vez de al revés): `prisma/schema.prisma`
   (`Employee.avatar`, `Student.avatar`), migración
   `20260724000000_rename_image_to_avatar` (`ALTER TABLE ... RENAME
   COLUMN image TO avatar`, preserva datos existentes), y el campo
   `image` renombrado a `avatar` en tipos/DTOs/schemas/swagger de
   `employees`, `students` y `auth` (incluye `LoginResponse.avatar` en
   `GET /auth/me` y `POST /auth/login`).
4. `students` no tiene endpoint de subida de archivo — ahí `avatar`
   sigue siendo un string plano que el cliente manda directo en el
   JSON (URL/ruta), sin multer de por medio. Solo se le aplicó el
   rename de columna/campo por consistencia con `employees`.

**Pendiente en el frontend:** actualizar
`create-update-employee.action.ts` y `update-my-account.action.ts` para
dejar de armar `FormData` en la creación/edición (ahora es JSON puro), y
agregar las llamadas nuevas a `POST /employees/:id/avatar` /
`POST /employees/me/avatar` cuando el usuario adjunte un archivo. Todo
campo `image` que el front use debe renombrarse a `avatar`.

## Rediseño de forgot-password: flujo basado en sesión (2026-07-24)

El flujo anterior (`POST /auth/forgot-password` público + `POST
/auth/change-password` público con JWT de un link de correo) se
reemplazó por un flujo de 2 pasos alineado con lo que el frontend ya
tiene implementado (`ForgotPasswordPage`/`ResetPasswordPage`,
`request-reset-password.action.ts`/`reset-password.action.ts`), que no
usa ningún link con token — todo pasa por login + sesión autenticada.

**Flujo nuevo:**

1. `POST /auth/request-reset-password` (público, body `{ email }`,
   antes `/auth/forgot-password` con body `{ username }`): busca al
   empleado por email, genera una contraseña temporal nueva (mismo
   patrón que `generateTempPassword()` de invitaciones) y un código de
   6 dígitos. Actualiza de inmediato `password` (hash de la temporal),
   `mustChangePassword = true`, y guarda el código **hasheado** +
   `passwordResetCodeExpiresAt` (15 min). Envía un correo con la
   contraseña temporal en claro + el código en claro (ya no hay
   `resetLink`). Responde 200 siempre, exista o no el email (anti
   enumeración, igual que antes).
2. El empleado inicia sesión normal (`POST /auth/login`) con su
   username + la contraseña temporal recibida. Esto ya funcionaba sin
   cambios — `login()` nunca bloqueó por `mustChangePassword`, solo lo
   regresa en la respuesta; el front (route guards en
   `protected.router.tsx`) ya redirige a `/auth/reset-password` cuando
   `mustChangePassword === true`.
3. `POST /auth/reset-password` (antes `/auth/change-password`, body
   `{ token, code, password, confirmPassword }`): ahora **requiere
   sesión autenticada** (`authenticate` middleware, igual que
   `/auth/me`) y el body es `{ code, password, confirmPassword }` — el
   empleado se identifica por `req.user.employeeId` de la sesión, no
   por ningún campo del body (el front manda además un `id` en el
   body por compatibilidad con su tipo `ResetPasswordRequest`, pero el
   backend lo ignora deliberadamente y confía solo en la sesión, para
   que nadie pueda cambiarle la contraseña a otro empleado mandando un
   `id` distinto). Verifica el código contra el hash guardado en el
   paso 1 y su expiración, y si todo es válido actualiza `password`,
   pone `mustChangePassword = false` y limpia
   `passwordResetCode`/`passwordResetCodeExpiresAt`.

**Cambios de esquema:** `Employee.passwordResetCode` (hash, nullable) y
`Employee.passwordResetCodeExpiresAt` (nullable) agregados en
`prisma/schema.prisma`, migración
`20260724010000_add_password_reset_code_to_employees`. No se tocó
`Student` — este flujo es solo para `Employee` (login de estudiantes no
existe hoy).

**Gap conocido, no resuelto en este cambio:** empleados creados por
invitación (`employee.service.ts` `create()`/`resendInvitation()`)
también quedan con `mustChangePassword = true` pero **nunca reciben un
código** (`invitationEmail`/`resendInvitationEmail` solo mandan
usuario+contraseña temporal, sin código). Si inician sesión con esa
contraseña temporal, el front los manda a `/auth/reset-password`, y ahí
se van a topar con "No hay una solicitud de restablecimiento de
contraseña activa" porque `passwordResetCode` nunca se llenó. Como
workaround funcional ya disponible: pueden ir a "olvidé mi contraseña"
ellos mismos con su email, lo cual genera una contraseña temporal +
código nuevos y sí les permite completar el flujo. No se atendió de
raíz porque no fue parte de lo pedido (solo forgot-password); si se
quiere cerrar del todo, la opción más simple es que
`create()`/`resendInvitation()` también generen y envíen un código
igual que `requestResetPassword`, usando la misma verificación en
`resetPassword()`.

## Corrección de 3 bugs reportados por el usuario (2026-07-24)

Se reportaron 5 bugs; 3 se confirmaron y corrigieron en el backend, 2
no se reprodujeron (ver sección "Investigados, no reproducidos" abajo).

**Corregidos:**

1. **`students` tab tutores — phoneNumber/email solo obligatorios si
   `isPrincipal=true`.** Antes eran `NOT NULL` en DB y requeridos
   siempre en zod, sin importar el tipo de tutor. Cambios:
   - `prisma/schema.prisma`: `StudentGuardian.phoneNumber`/`.email`
     ahora `String?`, migración
     `20260724020000_student_guardian_optional_contact` (`ALTER
     COLUMN ... DROP NOT NULL` en ambas columnas, sin pérdida de
     datos).
   - `student-guardian.schema.ts`: `phoneNumber`/`email` pasan a
     opcionales/nullable (helpers `optionalTrimmedString`/
     `optionalEmail`, mismo patrón de transform-a-`undefined` que
     `optionalSecondLastName` en `employee.schema.ts`), con
     `.refine()` que exige ambos cuando `isPrincipal === true` en
     `createStudentGuardianSchema`.
   - `student-guardian.service.ts` `update()`: como es un PATCH
     parcial, zod no puede validar la invariante contra el registro
     ya existente — se agregó el chequeo ahí mismo, calculando el
     `isPrincipal`/`phoneNumber`/`email` **resultante** (patch
     fusionado sobre el registro existente) y lanzando
     `ValidationError` si el resultante queda con `isPrincipal=true`
     pero `phoneNumber`/`email` nulos.
   - `student-guardian.types.ts`/`swagger.config.ts`: `phoneNumber`/
     `email` ahora `string | null` / `nullable: true`, y
     `CreateStudentGuardianBody.required` ya no los incluye.
   - Efecto colateral encontrado y arreglado en el mismo cambio:
     `student.service.ts` `sendCredentials()` mandaba correo a
     `guardian.email` sin checar null (ahora que el tipo permite
     `null`, TS lo marcó) — se agregó `if (!guardian.email) continue;`
     antes de enviar, ya que un guardian principal *debería* siempre
     tener email por la validación anterior, pero esto protege contra
     datos previos a esta migración.

2. **`academic-cycles` tab inscripciones — bloquear reinscripción del
   mismo alumno en el mismo ciclo, sin importar el status.**
   `academic-cycle-enrollment.service.ts` `create()` no tenía ningún
   chequeo de duplicados — se agregó un `findFirst({ where: {
   studentId, academicCycleId } })` (sin filtrar por `status`, para
   que "enrolled", "completed" y "dropped" cuenten igual) justo antes
   de generar el código, que lanza `ConflictError` (409) si ya existe.
   Documentado el 409 en el jsdoc de `POST
   /academic-cycles/{id}/enrollments` en `academic-cycle.routes.ts`.
   No se agregó constraint `@@unique` a nivel DB — si se quiere
   defensa en profundidad ahí también, es un cambio aparte.

3. **`students` tab ciclos escolares inscritos — falta `status` dentro
   de `academicCycle`.** El `INCLUDE_RELATIONS.academicCycle` en
   `academic-cycle-enrollment.service.ts` solo seleccionaba `{id,
   name}`; se amplió a `{id, name, status}`. Como `toRecord()` hace
   passthrough directo de `raw.academicCycle`, ningún otro cambio de
   service fue necesario — se propaga automáticamente a **todos** los
   endpoints de enrollments (list, paged, byId, create, update,
   `GET /students/:studentId/enrollments`), no solo al tab de
   estudiantes. Actualizado `academic-cycle-enrollment.types.ts`
   (`academicCycle.status: AcademicCycleStatus`, importado desde
   `academic-cycle.types.ts` en vez de redeclarar el union) y
   `swagger.config.ts` (`AcademicCycleEnrollmentRecord.academicCycle.status`).

**Investigados, no reproducidos (revisar con más detalle / posible bug
de frontend, no de backend):**

4. **"Ciclos escolares: retornando propiedad `description` que no
   existe."** Aclarado por el usuario: el sentido era el opuesto al
   que se investigó primero — el frontend nunca tuvo/usó un campo
   `description` en el ciclo escolar (core `AcademicCycle`), así que
   había que **eliminarlo**, no que faltara. Se quitó por completo:
   - `prisma/schema.prisma`: se eliminó
     `AcademicCycle.description`, migración
     `20260724030000_drop_academic_cycle_description` (`ALTER TABLE
     ... DROP COLUMN description`).
   - `academic-cycle.types.ts`: quitado de `AcademicCycleRecord`,
     `CreateAcademicCycleDto`, `UpdateAcademicCycleDto`.
   - `academic-cycle.schema.ts`: quitado de
     `createAcademicCycleSchema`/`updateAcademicCycleSchema`.
   - `academic-cycle.service.ts`: quitado de `buildWhereClause` (ya no
     forma parte de la búsqueda `q`), `toRecord`, `create`, `update`.
   - `swagger.config.ts`: quitado de `AcademicCycleRecord`,
     `CreateAcademicCycleBody`, `UpdateAcademicCycleBody`; y el jsdoc
     de `GET /academic-cycles` (`q`) ya no menciona "description" como
     campo buscable.
   - **No se tocó** `AcademicCycleWallet.description` ni
     `AcademicCycleGroup.description` — esos sí son campos reales que
     el frontend usa (tabs de wallet y school-groups), el reporte era
     específicamente sobre el ciclo escolar (core), no sobre esos
     sub-recursos.
5. **"Ciclos escolares tab inscripciones: la beca debe ser opcional."**
   Confirmado con el usuario que solo hacía falta revisar el zod:
   `academic-cycle-enrollment.schema.ts:57`,
   `scholarshipId: z.string().uuid().optional()` — ya es opcional ahí
   (y en `prisma/schema.prisma`, la migración original, los tipos, y
   `swagger.config.ts`'s `CreateAcademicCycleEnrollmentBody.required`,
   que tampoco lo incluye). No se hizo ningún cambio — el backend ya
   trata `scholarshipId` como opcional en todas las capas; si el
   formulario del front lo sigue pidiendo como obligatorio, es un bug
   de validación del lado del cliente.

## Campo `code` en conceptos de pago y cadena de wallet (2026-07-24)

El front agregó un campo `code: string` (código de control interno,
máximo 10 caracteres, único) a `PaymentConceptRequest/Response`. El
usuario preguntó si también aplicaba al wallet del ciclo escolar —
inicialmente investigué mal (vi que el input de `code` en
`AcademicCycleWalletPanelForm.tsx` está deshabilitado/derivado de
seleccionar un concepto de pago, y concluí que no había campo real
del lado del backend). El usuario corrigió: `AcademicCycleWalletItemRequest`
y `AcademicCycleWalletItemResponse` **sí** declaran `code: string`
requerido, igual que `name` — es un campo real que se guarda, no solo
UI. Revisando más a fondo también encontré que
`StudentWalletItemResponse` (el snapshot que ve el alumno/tutor) tiene
el mismo campo. Se agregó en las 3 tablas relacionadas:

1. **`PaymentConcept.code`** — `String @unique @db.VarChar(10)`,
   migración `20260724040000_add_payment_concept_code` (columna
   nullable → backfill placeholder desde `id` para filas existentes →
   `NOT NULL` + unique index). Único **globalmente**. Validado en zod
   (`payment-concept.schema.ts`, helper `codeField()`: trim + uppercase
   + máx 10 + solo `[A-Z0-9]`) y unicidad case-insensitive verificada
   en `create()`/`update()` del service (como ya se hacía con `name`).
   Seed (`prisma/seed.ts`) actualizado con códigos reales para los 5
   conceptos ya sembrados (`INSCRIP`, `COLEGMES`, `MATERIAL`,
   `UNIFORME`, `SEGURO`).
2. **`AcademicCycleWallet.code`** — `String @db.VarChar(10)`, único
   **por ciclo** (`@@unique([academicCycleId, code])`), no globalmente
   — a propósito, porque el mismo concepto (mismo código) se repite en
   el catálogo de wallet de ciclos distintos (el wallet está
   desacoplado de `PaymentConcept` desde la migración
   `academic_cycle_wallet_decouple_payment_concept`). Migración
   `20260724050000_add_academic_cycle_wallet_code`. Mismo patrón de
   validación zod y unicidad (ahora scoped a `academicCycleId`) en
   `academic-cycle-wallet.schema.ts`/`.service.ts`.
3. **`StudentWalletItem.code`** — `String @db.VarChar(10)`, sin
   constraint de unicidad propio (es un snapshot de solo lectura, igual
   que `name`/`amount`/`description` en esa tabla). Migración
   `20260724060000_add_student_wallet_item_code`, backfillea desde la
   fila de `academic_cycle_wallet` correspondiente
   (`academic_cycle_wallet_id`) para filas existentes.
   `AcademicCycleEnrollmentService.create()` (el snapshot que corre al
   inscribir un alumno) actualizado para copiar `code` del catálogo del
   wallet al crear el `StudentWalletItem`.

Actualizado en las 3: tipos (`*.types.ts`), swagger
(`PaymentConceptRecord`/`CreatePaymentConceptBody`/`UpdatePaymentConceptBody`,
`AcademicCycleWalletRecord`/`Create.../Update...Body`,
`StudentWalletItemRecord`), y los 409 documentados en las rutas para
código duplicado. Se agregaron tests nuevos en
`payment-concept.test.ts` para la unicidad de `code` en `create`/`update`
(al escribirlos se encontró que `update()` no tenía el chequeo de
unicidad de `code` ni lo incluía en `updateData` — se corrigió en el
mismo cambio, antes de que llegara a producción sin probar).

## Módulo Dashboard (2026-07-24)

Nuevo módulo `backend/src/modules/dashboard/` (no existía nada antes —
ni rutas, ni service, solo el moduleKey `"dashboard"` ya anticipado en
`security-role.types.ts`). Construido leyendo directamente el front ya
armado (componentes, hooks, interfaces en `dashboard.response.ts`,
mocks en `public/api/dashboard/*.json`), no solo la descripción del
usuario — dos discrepancias reales encontradas y confirmadas con el
usuario antes de programar (ver abajo).

**5 endpoints, todos `GET`, todos protegidos con `authorize("dashboard")`:**

1. `GET /dashboard/academic-cycles` → `AcademicCycleSummaryRecord`
   (`activeAcademicCyclesCount`, `activeStudentsCount`,
   `droppedStudentsCount`, `topGroups`). Si
   `activeAcademicCyclesCount === 0`, se corta ahí mismo y regresa todo
   lo demás en cero/vacío — no corre las queries pesadas.
   **Confirmado con el usuario**: `topGroups` es el **top 3 de grupos**
   (no de alumnos individuales) por promedio de calificaciones,
   porque así está el componente `TopGroupsTable.tsx` +
   `TopSchoolGroupResponse` ya construidos en el front. Se calcula sin
   SQL crudo (sin precedente de `$queryRaw`/`groupBy` cross-relation en
   este repo): una query trae los grupos activos de ciclos activos con
   `_count` de inscripciones (`status: "enrolled"`), otra trae las
   `StudentGrade` de esos grupos, y el promedio se agrega en JS
   (`Map<groupId, {sum, count}>`), se ordena desc y se recorta a 3.
   Grupos sin calificaciones registradas quedan fuera del ranking (nada
   que promediar).
2. `GET /dashboard/financial` → `FinancialSummaryRecord`
   (`totalPaidAmount`, `pendingAmount`, `forgivenPaymentsCount`,
   `totalForgivenAmount`), agregado sobre `StudentWalletItem` filtrado
   por `academicCycle.status = "active"` con 2 `aggregate()` de Prisma
   (uno para `isForgiven: false` con `_sum` de `amount`/
   `outstandingAmount`, otro para `isForgiven: true` con `_sum`/
   `_count`) — agregación del lado de la BD, no trae filas a JS. Mismo
   guard: sin ciclos activos, todo en cero sin correr las queries.
3. `GET /dashboard/announcements` → `AnnouncementSummaryRecord`
   (`activeAnnouncementsCount`: anuncios con `isActive`, no borrados, y
   dentro de su ventana `publishedAt`/`expiresAt` respecto a `now`;
   `viewedPercentage`: `SUM(viewedCount)/SUM(recipientsCount)*100`
   sobre ese mismo conjunto, 0 si no hay destinatarios). Ver la sección
   de cambios al modelo `Announcement` más abajo — este endpoint
   depende de 3 columnas nuevas que hoy nadie llena todavía.
4. `GET /dashboard/system` → `SystemSummaryRecord` (conteos simples:
   `securityRolesCount`, `jobTitlesCount` con `isDeleted: false`;
   `teachersEmployeesCount`/`administrativeEmployeesCount` via
   `Employee.jobTitle.jobTitleType`).
5. `GET /dashboard/teacher-employees` → `TeacherEmployeeSummaryRecord[]`
   (hasta 10, `orderBy: createdAt desc`). **Confirmado con el
   usuario**: es solo empleados tipo **maestro** (no administrativos,
   no alumnos), porque así están `LatestTeachersTable.tsx` +
   `TeacherEmployeeSummaryResponse` ya construidos en el front — no es
   un listado genérico de "usuarios registrados".

**Cambio de schema necesario y no anticipado por el usuario**:
`Employee` no tenía ninguna columna de fecha de creación, y
`TeacherEmployeeSummaryResponse.createdAt` (front) más el propio
"últimos registrados" lo requieren para poder ordenar. Se agregó
`Employee.createdAt` (`DateTime @default(now())`, migración
`20260724080000_add_employee_created_at`) — las filas existentes
quedan con el timestamp de cuando corrió la migración (no hay fecha de
alta real que rescatar).

**Cambios al modelo `Announcement`** (lo que pidió el usuario
explícitamente): 3 columnas nuevas —
`recipientsCount`/`viewedCount`/`viewsCalculatedAt`
(migración `20260724070000_add_announcement_view_tracking_columns`,
default 0/0/null). Diseño acordado con el usuario ("esto como lo
pudiera hacer" — delegó el diseño): en vez de que borrar registros de
notificación individuales pueda destruir el histórico de "cuánta gente
vio este anuncio", el agregado calculado vive directamente en
`Announcement`, sobreviviendo aunque las filas de notificación
individuales se borren después. **Alcance de HOY**: solo se agregaron
las columnas y se expusieron de solo lectura en
`announcement.types.ts`/`.service.ts` (no en
`Create`/`UpdateAnnouncementDto`, son cron-managed) y en swagger.
**Explícitamente fuera de alcance por ahora** (palabras del usuario:
"esto ahorita obtenlo, y haremos uso de cronjobs tanto para enviar
notificaciones como para actualizar estas visualizaciones"): no existe
todavía ninguna tabla de notificación por destinatario, ni el cron que
calcule/actualice estas 2 columnas — hoy siempre van a estar en 0
(`recipientsCount`/`viewedCount`) y `viewsCalculatedAt` en `null` hasta
que se construya ese cron en un cambio futuro. El endpoint del
dashboard ya está listo para leerlas en cuanto existan datos reales.

**Pendiente del lado del frontend** (no tocado, es un repo aparte):
las 5 `action.ts` del dashboard (`get-academic-cylces-summary.action.ts`
[sic, typo en el nombre del archivo original],
`get-financial-summary.action.ts`, `get-announcements-summary.action.ts`,
`get-system-summary.action.ts`, `get-latest-teachers-summary.action.ts`)
tienen una línea `// REMOVE MOCKABLE` que sobreescribe el endpoint real
con un JSON mockeado estático (`http://localhost/api/dashboard/*.json`)
sin importar el ambiente — hay que borrar esa línea en cada action para
que el front deje de leer los mocks y empiece a pegarle a estos 5
endpoints reales.

## Módulo Global Search (2026-07-24)

Nuevo módulo `backend/src/modules/global-search/`. El front **ya tenía
todo construido** esperando este endpoint: `GlobalSearchInput.tsx` en el
navbar, hook `useGetGlobalSearch` (debounce, `minLength: 5`), acción
`get-global-search.action.ts` (con el mismo patrón `// REMOVE MOCKABLE`
que el dashboard — hay que quitarle esa línea también), e interfaz
`GlobalSearchResponse`/`GlobalSearchRecordResponse` ya definida. El
backend implementa exactamente ese contrato.

**`GET /global-search?q=<term>`** → `GlobalSearchGroup[]`
(`{ module, records: [{ id, label, subtitle?, route }] }`), sin
`authorize()` de un solo moduleKey en la ruta (no existe un moduleKey
"global-search" ni en front ni en back) — en su lugar filtra **por
módulo, internamente**, contra `req.user.permissions`.

**Diseño (confirmado con el usuario antes de implementar):**

1. Búsqueda simple `contains`/ILIKE case-insensitive, **no** full-text ni
   fuzzy — reutiliza exactamente los mismos campos que cada módulo ya
   usa en su propio filtro `q` de listado (confirmado uno por uno:
   students, employees, academic-cycles, announcements,
   academic-levels, school-subjects, scholarships, payment-concepts,
   job-titles, security-roles — los 10 con `findAllPaged` real con
   `skip`/`take`, ninguno `findAll`-only).
2. **Top 3 por módulo**, con `take: 3` a nivel de Prisma/BD (no
   fetch-all + slice en JS) y `select` explícito (solo los campos que
   arman `label`/`subtitle`, no la fila completa).
3. Si un módulo no tiene matches, **se omite del arreglo de respuesta**
   por completo (no se manda `{module, records: []}`).
4. `route` se genera en el backend como `/${moduleKey}/${id}` — se
   confirmó que los 10 módulos siguen ese patrón 1:1 exacto en el router
   del front (`/students/:id`, `/scholarships/:id`, etc.), sin
   excepciones ni modales.

**Optimización (lo que pidió el usuario explícitamente — "cómo
pudiéramos optimizarla"):**

1. Las hasta-10 queries (una por módulo) corren en **paralelo**
   (`Promise.all`), no secuencial.
2. **Filtrado por permisos ANTES de consultar**: si
   `req.user.permissions` no tiene `canRead: true` para un moduleKey,
   ese módulo ni siquiera dispara su query — no es solo un filtro de
   seguridad post-hoc, reduce directamente cuántas queries corren.
   Verificado en vivo contra la BD sembrada: el rol `Docente` (que solo
   puede leer `dashboard`/`my-account`/`my-classes`/`academic-cycles`/
   `announcements`) buscando "primaria" solo recibe el grupo
   `academic-cycles` (no `academic-levels`, aunque también hay match
   ahí), y buscando "auxiliar" (que solo existe en `job-titles`/
   `security-roles`) recibe `[]` — ni siquiera se ejecutan esas 2
   queries para ese usuario.
3. **Mínimo de 5 caracteres** en `q`, validado en el backend
   (`global-search.schema.ts`) además del debounce del front — mismo
   número que ya usa el front, para que pegarle al endpoint directo (sin
   pasar por la UI) no permita el caso más caro (buscar 1-2 caracteres
   contra 10 tablas).

**Nota de mantenimiento futura (no implementada, solo mencionada):** si
algún día el volumen de datos crece mucho y el `ILIKE '%term%'` sin
índice empieza a pesar, la opción natural es un índice GIN/trigram
(`pg_trgm`) sobre las columnas de texto más buscadas — no se agregó
ahora porque el volumen actual (cientos de filas por tabla) no lo
justifica.

Verificado end-to-end contra la BD real sembrada (no solo `tsc`):
login como SuperAdmin y como un maestro (`Docente`), varios términos de
búsqueda (match múltiple, sin match, término corto rechazado con 400),
confirmando en cada caso el shape de respuesta y el filtrado por
permisos. Al conectarlo encontré y corregí un bug propio antes de
probarlo: se me olvidó agregar la línea `app.use("/global-search", ...)`
en `src/index.ts` — solo había puesto el `import`.
