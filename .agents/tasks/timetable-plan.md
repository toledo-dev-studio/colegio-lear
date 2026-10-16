# Implementation Plan — Full weekly timetable in the seed

Files to touch: `backend/prisma/seed.ts` (edit), `backend/prisma/seed-timetable.ts` (new, pure data/logic, no Prisma import), `backend/prisma/seed-timetable.test.ts` (new vitest).
Static verification only. DO NOT connect to the DB or run `npx prisma db seed` (Supabase unreachable from this machine).

## DO NOT TOUCH
- `backend/prisma/schema.prisma`, migrations, `backend/src/**` (except reading), credentials/password handling (`Estudiante123!`, `Docente123!`, `Admin789!`, `LR-2026-NNNN`), the storage upload blocks (task attachments/materials, already disabled in the working tree), students/groups/cycles counts, unrelated code. No commit or push unless asked.

## 1. Findings (read from the code)

### Model `AcademicCycleGroupCalendar` (schema.prisma ~593, table `core.academic_cycle_group_calendars`)
- `id` uuid PK. `day` enum `DayOfWeek` (seed uses lowercase strings `"monday"`..`"friday"`). `startTime`/`endTime` `DateTime @db.Time`. The seed stores them as `new Date("1970-01-01T08:00:00.000Z")`.
- FKs: `academicCycleId`, `academicCycleSchoolGroupId` (cascade), `academicCycleSchoolSubjectId` (-> `AcademicCycleSchoolSubject`, NOT the global catalog; Restrict), `teacherId` (Employee, Restrict). Subject AND teacher are mandatory.
- There is NO unique index, NO exclusion constraint and NO CHECK (the migration `20260716020000_academic_cycle_school_group_calendars` has none). The DB will accept any overlap. So the seed itself must guarantee correctness.
- Consequence: there is no "receso" row. Recess cannot be modelled (a row needs a subject and a teacher). Decision: recess is a GAP in the grid (11:00-11:30 primaria, 10:00-10:30 preescolar). Do not invent a "Receso" subject.

### Backend rules (backend/src/modules/academic-cycles/)
- `academic-cycle-school-group.schema.ts`: `startTime`/`endTime` must match `HH:mm` and `startTime < endTime` (string compare). Nothing else.
- `academic-cycle-school-group.service.ts`: the only enforced rule is that the subject must already be in the cycle (`AcademicCycleSchoolSubject`) (`toCalendarCreateData`). There is NO overlap check for teachers or groups. Teachers in the UI are derived from calendars (`findAllTeachers`, distinct subject:teacher pairs), the calendar list is ordered by `day, startTime`.
- Rules the seed must respect anyway (self-imposed, asserted in code): (a) `start < end`, HH:mm on the hour/half-hour; (b) a group never has two classes overlapping on the same day; (c) a teacher never has two classes overlapping on the same day (across groups); (d) every (group, subject) uses a cycle-subject that exists for that group's cycle; (e) `findTeacher` must find a teacher for every (subject, group).

### Current state of seed.ts (after commits 8708989 / c5d0954)
- 4 groups only: `groupPrimariaA/B` (primariaCycle), `groupPreescolarA/B` (preescolarCycle). Keys `primaria_a|primaria_b|preescolar_a|preescolar_b`. No other group has subjects.
- Calendar: `PRIMARIA_SCHEDULE` (5 slots) + `PRIMARIA_SCHEDULE_SLOT2` (3), `PREESCOLAR_SCHEDULE` (4) + `_SLOT2` (4); 3 loops producing `calendarEntries` with ids `ee000000-0011-4000-8000-<seq12>` seq 1..32; upserted with `update: {}` (seed.ts ~1297-1445). One class/day.
- Subjects wired (SCHOOL_SUBJECTS key -> cycle key `primaria_`/`preescolar_` + key in `ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026`, ids `ac000000-0013-...001-016`):
  - Primaria A+B (8): espanol_1p (Laura Fernández), matematicas_1p (Ricardo Salinas), ciencias_1p (Patricia Núñez), ingles_1p (Andrés Villarreal), historia_1p (Mónica Escobar), formacion_civica_1p (Héctor Ramírez), educacion_artistica_1p (Elena Castañeda), educacion_fisica_1p (Óscar Beltrán).
  - Preescolar A+B (8): espanol_1pe (Claudia Bravo), matematicas_1pe (Fernando Aguilar), ingles_1pe (Gabriela Soto), expresion_1pe (Rosa Ibarra = A only, Diego Paredes = B only), exploracion_1pe (Verónica Palacios), psicomotricidad_1pe (Sergio Mendoza), musica_1pe (Daniela Rangel), convivencia_1pe (Alicia Vargas).
  - Teachers: `TEACHERS_2026` (10 rows, lines ~524-536, `groups` arrays) and `EXTRA_TEACHERS_2026` (7 rows, ~627-636, loop ~639). Emails `buildStaffEmail(name, lastName, seq)`; extras use `TEACHERS_2026.length + ADMIN_STAFF_2026.length + 1 + j`.
  - Grades/tasks/chat are derived from `calendarEntries`, `PRIMARIA_SUBJECT_KEYS`, `PREESCOLAR_SUBJECT_KEYS` (grade index `s` matters: `gradeSeed = seq*13 + s*7 + eval*3`), so keep the key ORDER stable (see step 4).

## 2. Design decisions
1. **One shared pure module** `seed-timetable.ts` defines the grid as compact typed data and expands it in a loop. Reason: ~90 entries, not hand-written literals, and it can be unit-tested without a DB (vitest picks up `prisma/*.test.ts` by default; the project has no custom include, `npm test` = `vitest --run`).
2. **New id prefix `ee000000-0021-4000-8000-` + `String(n).padStart(12,"0")`**, n = 1..N in a fixed iteration order (group order primaria_a, primaria_b, preescolar_a, preescolar_b; then day Mon..Fri; then period ascending). Reason: the old ids `ee000000-0011-...001..032` hold different times; reusing them with `update: {}` would keep the stale rows. A new prefix keeps the "fixed-format uuid" convention and avoids mixing.
3. **Reconcile old slots deterministically:** in seed.ts, right before the upsert loop, run `prisma.academicCycleGroupCalendar.deleteMany({ where: { id: { in: LEGACY_CALENDAR_IDS } } })`, where `LEGACY_CALENDAR_IDS` = ids `ee000000-0011-4000-8000-000000000001..032` generated by a loop. Only those 32 known seed ids are deleted (not every row of the group), so rows created by hand in the admin UI are preserved. Then upsert the new entries with `update: { ...fields without id }` (full overwrite) so re-running after a grid tweak converges, and re-running unchanged is a no-op. Nothing else references calendar ids (tasks/materials/chat point to group+cycle-subject), so the delete is FK-safe. Leave the first-run risk documented: if an admin added a calendar manually that overlaps, the seed does not detect it.
4. **No teacher clash by construction + assertion.** Español is the problem: "daily 8-9" for both A and B at once needs 2 Español teachers, so add one Español teacher for group B in each level and restrict the existing one to A. Every other subject has a single teacher shared by A and B, so B's days are built as a one-period LEFT ROTATION of A's day (distinct subjects per day => no cell of B equals the same cell of A => the shared teacher is never in two places). `assertNoConflicts` verifies it anyway and throws before touching the DB.
5. **Periods (1 h each), recess as a gap:**
   - Primaria: P1 08:00-09:00, P2 09:00-10:00, P3 10:00-11:00, (receso 11:00-11:30), P4 11:30-12:30, P5 12:30-13:30 -> 5/day, 25 h/week.
   - Preescolar: P1 08:00-09:00, P2 09:00-10:00, (receso 10:00-10:30), P3 10:30-11:30, P4 11:30-12:30 -> 4/day, 20 h/week, ends 12:30.
6. **Two new primaria subjects** (needed for enough distinct subjects for 25 h): `geografia_1p` and `computacion_1p` (1° Primaria). Preescolar already has 8 distinct subjects (enough for 20 h).

## 3. Target grids (verified by hand: counts and no same-cell repeats)

Codes primaria: E=espanol_1p M=matematicas_1p C=ciencias_1p I=ingles_1p H=historia_1p A=educacion_artistica_1p F=educacion_fisica_1p V=formacion_civica_1p G=geografia_1p T=computacion_1p.
P1 = E every day (both groups, different teachers). Group A, periods P2..P5:

| Day | P2 | P3 | P4 | P5 |
|---|---|---|---|---|
| Mon | M | C | I | F |
| Tue | M | H | A | T |
| Wed | M | I | C | V |
| Thu | M | A | T | H |
| Fri | C | I | F | G |

Weekly hours (A and B): E5 M4 C3 I3 H2 A2 F2 T2 V1 G1 = 25. Group B, day by day = A's P2..P5 rotated left by one: Mon `C I F M`, Tue `H A T M`, Wed `I C V M`, Thu `A T H M`, Fri `I F G C`.

Preescolar codes: E=espanol_1pe M=matematicas_1pe I=ingles_1pe X=expresion_1pe (Rosa A / Diego B) P=exploracion_1pe S=psicomotricidad_1pe U=musica_1pe N=convivencia_1pe. P1 = E daily (two teachers). Group A, periods P2..P4:

| Day | P2 | P3 | P4 |
|---|---|---|---|
| Mon | M | P | U |
| Tue | I | S | X |
| Wed | M | N | P |
| Thu | X | I | S |
| Fri | M | U | N |

Weekly: E5 M3 I2 X2 P2 S2 U2 N2 = 20. Group B = A's P2..P4 rotated left by one: Mon `P U M`, Tue `S X I`, Wed `N P M`, Thu `I S X`, Fri `U N M`.

## 4. Ordered steps

- [ ] 1. Create `backend/prisma/seed-timetable.ts` (pure, no Prisma import; use the string `DayOfWeek` union locally).
      Export: `type TimetableSlot = { groupKey; day; period; subjectKey; start: "HH:mm"; end: "HH:mm" }`; `PRIMARIA_PERIODS`, `PREESCOLAR_PERIODS` (section 2.5); `PRIMARIA_GRID_A`, `PREESCOLAR_GRID_A` as `Record<Day, readonly SubjectKey[]>` for P2..P-last (section 3); `const DAILY_FIRST = "espanol_1p"/"espanol_1pe"`; `rotateLeft`; `buildTimetable(): TimetableSlot[]` (loops groups -> days -> periods; B = rotateLeft(A day); P1 = Español); `assertNoConflicts(slots, teacherOf: (subjectKey, groupKey) => string)` that throws on: group overlap same day, teacher overlap same day, start >= end; `LEGACY_CALENDAR_IDS` builder and `calendarId(n)` (`ee000000-0021-4000-8000-` + padStart 12).
      Files: `backend/prisma/seed-timetable.ts`
      Verify: step 2.

- [ ] 2. Create `backend/prisma/seed-timetable.test.ts` (vitest, same style as `backend/src/modules/academic-cycles/academic-cycle-school-group.service.test.ts`).
      Tests: primaria has 25 slots/group and Español on all 5 days at 08:00-09:00; preescolar 20 slots/group, ends <= 12:30; per-subject weekly counts match section 3; `assertNoConflicts` passes using a teacherOf map (Español/Expresión split by group, all others per subject); ids unique and in the fixed format; a negative test proving a teacher clash is detected; no slot overlaps the recess gap; total slot count = 2*25 + 2*20 = 90.
      Files: `backend/prisma/seed-timetable.test.ts`
      Verify: from `backend/`: `npx vitest run prisma/seed-timetable.test.ts` -> all pass.

- [ ] 3. Add catalog + wiring for the 2 new primaria subjects in seed.ts (constants only, nothing used yet).
      a) `SCHOOL_SUBJECTS`: append `geografia_1p: c3000000-0003-4000-8000-000000000047`, `computacion_1p: ...000000000048`.
      b) `ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026`: append `primaria_geografia_1p: ac000000-0013-4000-8000-000000000017`, `primaria_computacion_1p: ...000000000018`.
      c) `ENRICHMENT_SUBJECTS` table (~1083): add two rows (1° Primaria, `primaria`/`primeroPri`): Geografía "Mapas, puntos cardinales y paisajes del entorno cercano"; Computación "Uso básico de la computadora, teclado y juegos educativos".
      d) Cycle-subject tuple list (~1260): add `["primaria_geografia_1p", primariaCycle.id, SCHOOL_SUBJECTS.geografia_1p]`, `["primaria_computacion_1p", primariaCycle.id, SCHOOL_SUBJECTS.computacion_1p]`.
      e) `SUBJECT_DISPLAY_NAME_BY_KEY` (~1468): `primaria_geografia_1p: "Geografía"`, `primaria_computacion_1p: "Computación"`.
      f) Update the enrichment log/comment counts (34 -> 36, catalog 46 -> 48) only where they are hard-coded; prefer the dynamic counts already used.
      Files: `backend/prisma/seed.ts`
      Verify: step 7 type-check.

- [ ] 4. Teachers (seed.ts). Depends on step 3 only for key names.
      a) Change `TEACHERS_2026` Laura Fernández `groups` to `["primaria_a"]` and Claudia Bravo `groups` to `["preescolar_a"]` (do NOT reorder/add rows: admin-staff emails depend on `TEACHERS_2026.length`).
      b) APPEND to `EXTRA_TEACHERS_2026` (after Alicia Vargas, so j = 7..10 and existing emails stay identical): `Mariana Téllez Ibáñez` geografia_1p [primaria_a, primaria_b]; `Jorge Olvera Pineda` computacion_1p [primaria_a, primaria_b]; `Sofía Carrillo Durán` espanol_1p [primaria_b]; `Lucía Montoya Reyes` espanol_1pe [preescolar_b]. Expected usernames mtellez, jolvera, scarrillo, lmontoya (`buildUsername` dedupes; none collides with the existing list). The existing loop (~639) already builds email/phone/password (`teacherPassword`, `docenteRole`, `JOB_TITLES.docente`) — do not change it. Update its log label if it hard-codes 7.
      c) Add a comment explaining why Español has two teachers (synchronised 08:00 daily for A and B).
      Files: `backend/prisma/seed.ts`
      Verify: step 7.

- [ ] 5. Replace the schedule block in seed.ts (~1297-1445).
      Import `buildTimetable`, `assertNoConflicts`, `calendarId`, `LEGACY_CALENDAR_IDS` from `./seed-timetable`. Remove `PRIMARIA_SCHEDULE*`, `PREESCOLAR_SCHEDULE*` and the three loops. Define explicitly, in this order to keep the grade index `s` stable: `PRIMARIA_SUBJECT_KEYS = [espanol_1p, matematicas_1p, ciencias_1p, ingles_1p, historia_1p, formacion_civica_1p... ]` — exactly the current derived order: espanol, matematicas, ciencias, ingles, historia, educacion_artistica, educacion_fisica, formacion_civica, then geografia_1p, computacion_1p appended. `PREESCOLAR_SUBJECT_KEYS` = current order (espanol, matematicas, ingles, expresion, exploracion, psicomotricidad, musica, convivencia). Keep `findTeacher`.
      Build `calendarEntries` by mapping `buildTimetable()` through `findTeacher(slot.subjectKey, slot.groupKey)`, group id map (`GROUPS_BY_KEY` or the four `groupX` vars), cycle id (primaria/preescolar), cycle-subject lookup `` `${prefix}_${subjectKey}` ``, `startTime/endTime` via `new Date(`1970-01-01T${t}:00.000Z`)`, id `calendarId(i+1)`. Call `assertNoConflicts(timetable, (s,g)=>findTeacher(s,g).employeeId)` BEFORE any DB write. Then `deleteMany` of `LEGACY_CALENDAR_IDS` (decision 2.3), then upsert each entry with `update` = all fields except id. Log: `Class schedule: ${calendarEntries.length} calendar entries` (expected 90) and the number of legacy entries removed.
      Keep the comment that recess is a gap because the model cannot represent non-class rows.
      Files: `backend/prisma/seed.ts`
      Verify: step 7.

- [ ] 6. Check derived blocks still hold (read-only review, fix if needed in seed.ts).
      Task seeding (`groupSubjectPairs`, ~1500) dedups by (group, cycle-subject), so pairs = 2x10 primaria + 2x8 preescolar = 36 pairs (72 tasks on a fresh DB); chat messages per (enrollment, teacher) are derived from `groupToTeacherIds` and grow automatically (known limitation: on an already-seeded DB the chat guard skips enrollments that already have messages, so new teachers will not get an opening message; not in scope). Grades: additive `createMany({ skipDuplicates: true })` already in place; with 10 primaria subjects a fresh DB creates 36*10*3 + 36*8*3 = 1944 grades; an already-seeded DB only adds the missing rows. Update any hard-coded expected counts in log messages/comments to be dynamic.
      Files: `backend/prisma/seed.ts`
      Verify: step 7.

- [ ] 7. Static verification (only).
      - From `backend/`: `npx vitest run prisma/seed-timetable.test.ts` -> pass; then `npx vitest run` (or `npm test`) -> whole suite still passes.
      - `npx tsc --noEmit` in `backend/` -> exit 0 (NOTE: `tsconfig.json` includes only `src/**/*`, so this does not type-check prisma/).
      - Type-check the seed: create temp `backend/tsconfig.seedcheck.tmp.json` = `{ "extends": "./tsconfig.json", "compilerOptions": { "rootDir": ".", "noEmit": true }, "include": ["prisma/seed.ts", "prisma/seed-timetable.ts", "src/**/*"] }`, run `npx tsc --noEmit -p tsconfig.seedcheck.tmp.json` -> exit 0, then DELETE the temp file.
      - Review `git diff -- backend/prisma`: all new UUIDs appear once (047/048, ac..017/018, ee...0021 generated), no change to schema/migrations/credentials/storage blocks, no `@ts-ignore`.
      - Do NOT run `npx prisma db seed`. When the user later runs it against a reachable DB, `npx prisma db seed` from `backend/` is enough (no migrate, no generate); it is idempotent: subjects/cycle-subjects/employees upsert on natural keys, calendars delete the 32 legacy ids then upsert fixed new ids, grades `skipDuplicates`.
      Files: none kept except the two new seed-timetable files.

## 5. Expected result (for the final summary)
- Primaria A/B: Español 08:00-09:00 Mon-Fri, 25 classes/week each, 10 subjects, day 08:00-13:30 with a 30-min gap at 11:00. Preescolar A/B: 20 classes/week, 8 subjects, 08:00-12:30 with a gap at 10:00. 90 calendar entries, 4 new teachers (total 21 teachers), 2 new subjects (total catalog 48).
- Not represented: recess rows (model needs a subject and teacher), hence a gap.
- Risks to mention: Español of group B now has a different teacher than before; chat opening messages for new teachers only on a fresh DB; the seed cannot detect manual admin-UI calendars that overlap.
