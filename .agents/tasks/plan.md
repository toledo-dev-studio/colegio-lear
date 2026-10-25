# Implementation Plan — Enrich seeded school subjects

Only file to edit: `backend/prisma/seed.ts` (currently 2007 lines). Do NOT edit `schema.prisma`, add migrations, change passwords/credentials, or touch unrelated code.
Note: `seed.ts` already has uncommitted edits in the working tree (blob-storage upload for task attachments/materials commented out). Leave those as they are. Do not revert or "fix" them.

## 1. How a subject reaches a student (traced from the code)

1. `SCHOOL_SUBJECTS` (seed.ts:44) holds fixed ids. `prisma.schoolSubject.upsert` creates the global catalog row. The `where` is `name_educationLevelId`, the `create` sets the fixed `id`, and `update: {}`. The unique key is `@@unique([name, educationLevelId])`.
2. The catalog row alone is NOT visible to students. The student portal reads subjects through the student's cycle and group:
   - `AcademicCycleSchoolSubject` (per-cycle copy). Unique on `[academicCycleId, schoolSubjectId]`. Its fixed ids come from `ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026` (seed.ts:113). Seeded in the "Academic Cycle School Subjects" block (seed.ts:~1082) from a tuple list `[key, cycleId, SCHOOL_SUBJECTS.x]`.
   - `AcademicCycleGroupCalendar` (schedule slot). It needs: group, `academicCycleSchoolSubjectId`, `teacherId` (an Employee), day, times. Built from `PRIMARIA_SCHEDULE` / `PREESCOLAR_SCHEDULE` (seed.ts:~1133-1150) and the two `for` loops that push into `calendarEntries` (seed.ts:~1170-1230). Ids are `ee000000-0011-4000-8000-${calendarSeq padded to 12}`.
   - The student-web "Materias" page (`frontend/student-web/src/modules/subjects`) builds cards from the group's TEACHERS (derived from calendars) plus calendars (`findAllTeachers` in `academic-cycle-school-group.service.ts`). The "Calendario" page uses calendars. So a subject with no calendar slot plus a teacher is invisible to the student.
   - `StudentGrade` (student-web "/grades") is created per enrollment × `config.subjectKeys` × 3 evaluations, from `GROUP_CONFIGS[].subjectKeys` (seed.ts:~1576). `PRIMARIA_SUBJECT_KEYS` / `PREESCOLAR_SUBJECT_KEYS` are DERIVED from the schedule constants, so adding schedule rows also feeds grades.
   - Tasks (`SchoolSubjectTask`) are seeded per (group, cycle-subject) pair derived from `calendarEntries`, so they come for free. Their display name comes from `SUBJECT_DISPLAY_NAME_BY_KEY` (seed.ts:~1258). Missing keys fall back to "la materia".
   - Chat messages: one per teacher per group, derived from `calendarEntries`, so they come for free on a fresh DB.
3. There are only TWO cycles and four groups: "Primaria 2026" (1° Primaria, groups 1° A/B) and "Preescolar 2026" (1° Preescolar, groups 1° A/B). All 72 students are in them. Subjects for 2° Preescolar, 2° Primaria, 1° and 2° Secundaria have no cycle, group or student, so they are catalog-only (visible in the admin `school-subjects` module, not to students). Do NOT invent new cycles, groups or students. That is out of scope and would change student counts and LR codes.

## 2. Design decisions

- **Students' real enrichment = 1° Primaria (5 → 8 subjects) and 1° Preescolar (4 → 8 subjects).** These are the only levels students can see.
- **Catalog-only additions** for the other four levels, so every level has ~6-8 subjects as requested. They only touch `SCHOOL_SUBJECTS` and the enrichment upsert block, nothing else.
- **"Expresión y Creatividad" already exists** for 1° Preescolar. Do NOT add a near-duplicate "Expresión Artística". Add "Música y Canto" instead.
- **New school-subject upserts go in one new data-driven block** after the "New School Subjects (2026 dataset)" block. The call shape is identical to the existing ones (`where: name_educationLevelId`, `update: {}`, `create` with fixed id, `isActive: true`, `academicLevelId`, `educationLevelId`). It is mapped from a small table in a `Promise.all`, like the tuple table already used for cycle subjects. Reason: 34 hand-written 13-line upserts would be pure noise.
- **ID stability on an already-seeded DB (critical).** All existing rows and ids must keep meaning exactly what they mean today. So:
  - New constants are APPENDED after existing ones with the next numbers.
  - The existing calendar loops are NOT edited or reordered. New slots use a SECOND pass placed after them, so `calendarSeq` 1-18 stay the same and new entries get 19-32.
  - Existing teachers stay untouched in `TEACHERS_2026`. New teachers go in a NEW array `EXTRA_TEACHERS_2026`, processed AFTER the admin-staff loop. Reason: admin-staff emails use `i + 1 + TEACHERS_2026.length`. Growing `TEACHERS_2026` would shift them to new emails, create duplicate admin accounts, and crash on the unique `username`.
  - New subjects are appended to the schedule arrays AFTER the existing ones, so the index `s` in the grade formula (`gradeSeed = seq*13 + s*7 + eval*3`) is unchanged for existing subjects. Existing grade values do not change.
- **Grades must become additive.** The current block is guarded by `existingGrades === 0`, so on a DB that is already seeded (the user's case) students would never receive grades for the new subjects. Replace it with `createMany({ data, skipDuplicates: true })` (unique `[academicCycleEnrollmentId, schoolSubjectId, evaluationNumber]` makes it idempotent).
- **New schedule slot ("slot 2")**, because the current timetable already uses one class per day at 08:00-10:00: Group A 10:00-11:00, Group B 11:00-12:00 (school ends 13:00 per the announcements). The same subject teacher teaches A then B an hour apart, so there is no teacher overlap, the same pattern as slot 1.
- **Known limitation (do not fix):** the chat-message guard (`existingChatMessages === 0`) is per enrollment. On an already-seeded DB the new teachers will not get an opening student message. A fresh seed does. Chat is not part of this request.
- **Known risk (do not fix, mention in the final summary):** if someone created, via the admin UI, a subject with the same (name, educationLevel) as one of the 7 subjects that reach students, the upsert keeps that row with its own id. The fixed ids in `SCHOOL_SUBJECTS` would then violate FKs when creating the cycle-subject or grade rows. The existing seed has the same exposure.

## 3. Subjects to add (34 new = 46 total; per level after change)

No duplicate `(name, educationLevel)` pair with existing records (checked against the 12 existing: Mat/Esp/Ciencias/Historia/Inglés 1°Pri, Mat 2°Pri, Mat+Historia 1°Sec, Esp/Mat/Inglés/Expresión 1°Pre). The same name on different levels is fine.

### 3a. Reach students (get UUIDs in all structures)

| key (SCHOOL_SUBJECTS) | name | level | description |
|---|---|---|---|
| `formacion_civica_1p` | Formación Cívica y Ética | 1° Primaria | Valores, convivencia y reglas de participación en comunidad |
| `educacion_artistica_1p` | Educación Artística | 1° Primaria | Artes visuales, música y expresión corporal |
| `educacion_fisica_1p` | Educación Física | 1° Primaria | Desarrollo motriz, juegos y hábitos de vida saludable |
| `exploracion_1pe` | Exploración del Mundo | 1° Preescolar | Observación del entorno natural y social a través del juego |
| `psicomotricidad_1pe` | Psicomotricidad | 1° Preescolar | Coordinación motriz gruesa y fina, equilibrio y lateralidad |
| `musica_1pe` | Música y Canto | 1° Preescolar | Ritmo, canciones y expresión sonora |
| `convivencia_1pe` | Convivencia y Valores | 1° Preescolar | Educación socioemocional, hábitos y respeto a los demás |

Result: 1° Primaria = 8, 1° Preescolar = 8.

### 3b. Catalog-only (SCHOOL_SUBJECTS + enrichment upserts only)

- **2° Preescolar (6):** `espanol_2pe` Español · `matematicas_2pe` Matemáticas · `ingles_2pe` Inglés · `exploracion_2pe` Exploración del Mundo · `psicomotricidad_2pe` Psicomotricidad · `musica_2pe` Música y Canto.
- **2° Primaria (+7 → 8 with existing Matemáticas):** `espanol_2p` Español · `ciencias_2p` Ciencias Naturales · `ingles_2p` Inglés · `historia_2p` Historia · `geografia_2p` Geografía · `educacion_fisica_2p` Educación Física · `educacion_artistica_2p` Educación Artística.
- **1° Secundaria (+6 → 8 with existing Matemáticas + Historia):** `espanol_1s` Español · `ciencias_1s` Ciencias Naturales · `ingles_1s` Inglés · `formacion_civica_1s` Formación Cívica y Ética · `educacion_fisica_1s` Educación Física · `tecnologia_1s` Tecnología.
- **2° Secundaria (8):** `matematicas_2s` Matemáticas · `espanol_2s` Español · `ciencias_2s` Ciencias Naturales · `ingles_2s` Inglés · `historia_2s` Historia · `geografia_2s` Geografía · `formacion_civica_2s` Formación Cívica y Ética · `educacion_fisica_2s` Educación Física.

Write a one-sentence Spanish description for each 3b entry in the same tone as the existing ones (≤ 500 chars; name ≤ 150). `academicLevelId` is the level's parent (`preescolar.id`, `primaria.id` or `secundaria.id`).

## 4. UUID scheme (all fixed, all unique in the file)

Existing formats, which the new ones must copy exactly:

- `SCHOOL_SUBJECTS`: `c3000000-0003-4000-8000-` + 12-digit zero-padded DECIMAL counter. Existing 001-012. The last existing one is `...000000000012`.
- `ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026`: `ac000000-0013-4000-8000-` + 12-digit counter. Existing 001-009.
- Calendar entries: `ee000000-0011-4000-8000-` + `calendarSeq` padded to 12. Dynamic, existing 1-18. New ones get 19-32 automatically from the continued `calendarSeq`.

### 4a. New `SCHOOL_SUBJECTS` entries (append under a `// 2026 subject enrichment` comment, after `expresion_1pe`)

```
formacion_civica_1p:    c3000000-0003-4000-8000-000000000013
educacion_artistica_1p: c3000000-0003-4000-8000-000000000014
educacion_fisica_1p:    c3000000-0003-4000-8000-000000000015
exploracion_1pe:        c3000000-0003-4000-8000-000000000016
psicomotricidad_1pe:    c3000000-0003-4000-8000-000000000017
musica_1pe:             c3000000-0003-4000-8000-000000000018
convivencia_1pe:        c3000000-0003-4000-8000-000000000019
espanol_2pe:            ...000000000020
matematicas_2pe:        ...000000000021
ingles_2pe:             ...000000000022
exploracion_2pe:        ...000000000023
psicomotricidad_2pe:    ...000000000024
musica_2pe:             ...000000000025
espanol_2p:             ...000000000026
ciencias_2p:            ...000000000027
ingles_2p:              ...000000000028
historia_2p:            ...000000000029
geografia_2p:           ...000000000030
educacion_fisica_2p:    ...000000000031
educacion_artistica_2p: ...000000000032
espanol_1s:             ...000000000033
ciencias_1s:            ...000000000034
ingles_1s:              ...000000000035
formacion_civica_1s:    ...000000000036
educacion_fisica_1s:    ...000000000037
tecnologia_1s:          ...000000000038
matematicas_2s:         ...000000000039
espanol_2s:             ...000000000040
ciencias_2s:            ...000000000041
ingles_2s:              ...000000000042
historia_2s:            ...000000000043
geografia_2s:           ...000000000044
formacion_civica_2s:    ...000000000045
educacion_fisica_2s:    ...000000000046
```

Where `...` abbreviates the full prefix `c3000000-0003-4000-8000-`. Write the full UUID in the file. That is 46 keys in total and 46 distinct ids (001-046).

### 4b. New `ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026` entries (key = `<cycle>_<subjectKey>`, append after `preescolar_expresion_1pe`)

```
primaria_formacion_civica_1p:    ac000000-0013-4000-8000-000000000010
primaria_educacion_artistica_1p: ac000000-0013-4000-8000-000000000011
primaria_educacion_fisica_1p:    ac000000-0013-4000-8000-000000000012
preescolar_exploracion_1pe:      ac000000-0013-4000-8000-000000000013
preescolar_psicomotricidad_1pe:  ac000000-0013-4000-8000-000000000014
preescolar_musica_1pe:           ac000000-0013-4000-8000-000000000015
preescolar_convivencia_1pe:      ac000000-0013-4000-8000-000000000016
```

The key MUST be exactly `primaria_` / `preescolar_` + the `SCHOOL_SUBJECTS` key. The calendar loops build the lookup key with the template literal `` `primaria_${slot.subjectKey}` ``.

### 4c. Calendar entries

No manual UUIDs. Generated by `calendarSeq` (19-32). Do not change the id template.

## 5. Teachers

Yes, 7 new teachers are required. The pattern is one teacher per subject for both groups, and `findTeacher` throws `No teacher found for ...` otherwise. Keep passwords as they are: reuse the already-hashed `teacherPassword` ("Docente123!"), `docenteRole.id` and `JOB_TITLES.docente`. Do not change any credential logic.

```
EXTRA_TEACHERS_2026 (order matters, index j = 0..6):
j0 Héctor  Ramírez   Lozano  subjectKey formacion_civica_1p    groups primaria_a, primaria_b     -> username hramirez
j1 Elena   Castañeda Vidal   subjectKey educacion_artistica_1p groups primaria_a, primaria_b     -> ecastaneda
j2 Óscar   Beltrán   Mejía   subjectKey educacion_fisica_1p    groups primaria_a, primaria_b     -> obeltran
j3 Verónica Palacios Cruz    subjectKey exploracion_1pe        groups preescolar_a, preescolar_b -> vpalacios
j4 Sergio  Mendoza   Lara    subjectKey psicomotricidad_1pe    groups preescolar_a, preescolar_b -> smendoza
j5 Daniela Rangel    Ortega  subjectKey musica_1pe             groups preescolar_a, preescolar_b -> drangel
j6 Alicia  Vargas    Nieto   subjectKey convivencia_1pe        groups preescolar_a, preescolar_b -> avargas
```

Uniqueness (Employee has `@unique` on `email` and `username`):

- **Username:** use the existing `buildUsername(name, firstLastName, usedUsernames)`, which strips accents and dedupes within the run. The usernames above do not collide with any existing one (`sadmin`, `atwo`, `lfernandez`, `rsalinas`, `pnunez`, `avillarreal`, `mescobar`, `cbravo`, `faguilar`, `gsoto`, `ribarra`, `dparedes`, `bmolina`, `jsalcedo`, `kespinoza`).
- **Email:** `buildStaffEmail(name, firstLastName, TEACHERS_2026.length + ADMIN_STAFF_2026.length + 1 + j)`. That gives sequence numbers 14-20, which continue after teachers (1-10) and admin staff (11-13), so every email is unique. The upsert `where` is `{ email }` with `update: {}` (idempotent, same as existing).
- **Phone:** `` `55100${String(20000 + TEACHERS_2026.length + j).padStart(5, "0")}` `` (20010-20016). Phone is not unique in the schema, but this keeps the series unique.

## 6. Ordered implementation steps (each leaves the file compiling)

- [ ] 1. Add the constants (seed.ts top of file).
      Append the 34 new ids from 4a to `SCHOOL_SUBJECTS` and the 7 ids from 4b to `ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026`. Keep the format of the neighbouring lines. Check there are 46 distinct suffixes 001-046 and 16 distinct `ac...` suffixes 001-016.
      Files: `backend/prisma/seed.ts`
      Verify: static check from step 8 (constants are unused at this point; this is fine, `noUnusedLocals` is not enabled).

- [ ] 2. Add the enrichment subject upserts.
      Right after the `console.log("  ✓ School subjects (2026 dataset): 6 records");` line (seed.ts:~984) and before `// --- Academic Cycles (2026) ---`, add a block `// --- Additional School Subjects (2026 enrichment) ---`. Define `const ENRICHMENT_SUBJECTS = [...] as const` with one tuple or object per row of section 3 (`key: keyof typeof SCHOOL_SUBJECTS`, `name`, `description`, `academicLevel`, `educationLevel`), using the in-scope `preescolar/primaria/secundaria` and `primeroPre/segundoPre/primeroPri/segundoPri/primeroSec/segundoSec` variables. Then `await Promise.all(ENRICHMENT_SUBJECTS.map((s) => prisma.schoolSubject.upsert({ where: { name_educationLevelId: { name: s.name, educationLevelId: s.educationLevel.id } }, update: {}, create: { id: SCHOOL_SUBJECTS[s.key], name: s.name, description: s.description, isActive: true, academicLevelId: s.academicLevel.id, educationLevelId: s.educationLevel.id } })))`. Keep `update: {}`.
      Log: `console.log(`  ✓ School subjects (2026 enrichment): ${ENRICHMENT_SUBJECTS.length} records (total catalog: ${Object.keys(SCHOOL_SUBJECTS).length})`)`. This prints 34 and 46.
      Count logs: leave the two existing logs ("School subjects: 6 records" at seed.ts:~784 and "(2026 dataset): 6 records" at ~984) as they are. Each is still true for its own block, and the new log reports the new count and the total catalog size (46). Do not rewrite them to 46, because that would be false for those blocks.
      Files: `backend/prisma/seed.ts`
      Verify: step 8.

- [ ] 3. Add the extra teachers. Depends on step 1 only for key names.
      a) Change the type of `resolvedTeachers` (seed.ts:~505) from `Array<(typeof TEACHERS_2026)[number] & { employeeId: string }>` to `Array<{ subjectKey: string; groups: readonly string[]; employeeId: string }>`. `findTeacher` only uses `subjectKey`, `groups` and `employeeId`, and the existing `.push({ ...t, employeeId })` still type-checks.
      b) Do NOT modify `TEACHERS_2026`, `ADMIN_STAFF_2026` or their loops.
      c) Right after the `console.log("  ✓ Administrative staff employees ...")` line (seed.ts:~565), add `const EXTRA_TEACHERS_2026 = [...]` (section 5) and a loop that mirrors the existing teacher loop: `buildUsername`, `buildStaffEmail(..., TEACHERS_2026.length + ADMIN_STAFF_2026.length + 1 + j)`, the phone formula above, `prisma.employee.upsert({ where: { email }, update: {}, create: {... same fields, password: teacherPassword, securityRoleId: docenteRole.id, jobTitleId: JOB_TITLES.docente } })`, and `resolvedTeachers.push({ ...t, employeeId: employee.id })`.
      d) Log: `console.log(`  ✓ Additional teacher employees: ${EXTRA_TEACHERS_2026.length} records`)`. Leave the existing "Teacher employees: 10 records" line alone (it uses `TEACHERS_2026.length`, still 10).
      Files: `backend/prisma/seed.ts`
      Verify: step 8.

- [ ] 4. Register the new subjects in each cycle and name them for tasks. Depends on step 1.
      a) In the `academicCycleSchoolSubjectsBySubjectKey` tuple list (seed.ts:~1090), append 7 tuples in the same style: `["primaria_formacion_civica_1p", primariaCycle.id, SCHOOL_SUBJECTS.formacion_civica_1p]`, `..._educacion_artistica_1p`, `..._educacion_fisica_1p`, and `["preescolar_exploracion_1pe", preescolarCycle.id, SCHOOL_SUBJECTS.exploracion_1pe]`, `..._psicomotricidad_1pe`, `..._musica_1pe`, `..._convivencia_1pe`. Do not change the upsert body (the `academicCycleId_schoolSubjectId` key with `update: {}` is already idempotent and tolerates auto-healed rows).
      b) In `SUBJECT_DISPLAY_NAME_BY_KEY` (seed.ts:~1258), add the 7 keys with display names "Formación Cívica y Ética", "Educación Artística", "Educación Física", "Exploración del Mundo", "Psicomotricidad", "Música y Canto", "Convivencia y Valores".
      Files: `backend/prisma/seed.ts`
      Verify: step 8.

- [ ] 5. Add the second schedule pass. Depends on steps 3 and 4 (teachers and cycle subjects must exist, or `findTeacher` throws at seed time).
      a) After `PRIMARIA_SCHEDULE` add `PRIMARIA_SCHEDULE_SLOT2 = [{ day: "monday", subjectKey: "educacion_artistica_1p" }, { day: "tuesday", subjectKey: "educacion_fisica_1p" }, { day: "wednesday", subjectKey: "formacion_civica_1p" }] as const`. After `PREESCOLAR_SCHEDULE` add `PREESCOLAR_SCHEDULE_SLOT2 = [{ day: "monday", subjectKey: "exploracion_1pe" }, { day: "tuesday", subjectKey: "psicomotricidad_1pe" }, { day: "wednesday", subjectKey: "musica_1pe" }, { day: "thursday", subjectKey: "convivencia_1pe" }] as const`.
      b) Change `PRIMARIA_SUBJECT_KEYS` / `PREESCOLAR_SUBJECT_KEYS` to derive from the concatenation `[...PRIMARIA_SCHEDULE, ...PRIMARIA_SCHEDULE_SLOT2]` (and the preescolar equivalent). The ORIGINAL array must stay FIRST, so the subject indices used by the grade formula don't move. Keep the `Array.from(new Set(...)) as (keyof typeof SCHOOL_SUBJECTS)[]` form.
      c) Do NOT edit or reorder the two existing calendar `for` loops. AFTER both of them (and before the `for (const entry of calendarEntries)` upsert loop), add a second pass with the same body. Iterate the four groups in this order: `primaria_a`, `primaria_b`, `preescolar_a`, `preescolar_b`. Use start/end `"10:00"/"11:00"` for the `_a` groups and `"11:00"/"12:00"` for the `_b` groups. Use the slot-2 arrays, the same `findTeacher`, the same `` `${prefix}_${slot.subjectKey}` `` lookup in `academicCycleSchoolSubjectsBySubjectKey`, and the same `calendarSeq++` and id template. Add a comment: "Second pass appended after the original loops on purpose: keeps calendarSeq 1-18 (existing ids) stable; new entries are 19-32". `PRIMARIA/PREESCOLAR` cycle ids and `academicCycleId` stay as in the existing loops. Sequence check: primaria_a 19-21, primaria_b 22-24, preescolar_a 25-28, preescolar_b 29-32.
      d) Also update the comment above the schedule constants (group A 08:00-09:00 / B 09:00-10:00 for slot 1; A 10:00-11:00 / B 11:00-12:00 for slot 2).
      Files: `backend/prisma/seed.ts`
      Verify: step 8. The "Class schedule" log is dynamic (`calendarEntries.length`) and will print 32. The "Academic cycle school subjects" log is dynamic and will print 16.

- [ ] 6. Make grades additive (so already-seeded students get the new subjects).
      In the grade block (search `// Grades — only create if this enrollment doesn't have them yet`, seed.ts:~1790), remove the `existingGrades === 0` guard and the per-row `prisma.studentGrade.create`. Build an array of rows with the IDENTICAL values (same `gradeSeed = globalStudentSeq * 13 + s * 7 + evaluationNumber * 3`, `grade: buildGrade(gradeSeed)`, `evaluationNumber`, `schoolSubjectId: SCHOOL_SUBJECTS[subjectKey]`, `academicCycleEnrollmentId: enrollment.id`), then `const { count } = await prisma.studentGrade.createMany({ data: rows, skipDuplicates: true }); totalGradesCreated += count;`. Update the comment to say it's additive and idempotent via the unique `[academicCycleEnrollmentId, schoolSubjectId, evaluationNumber]`. Leave every other per-student block (attendance, chat, wallet, allergies, guardian) untouched.
      Files: `backend/prisma/seed.ts`
      Verify: step 8.

- [ ] 7. Final read-through of the diff (`git diff -- backend/prisma/seed.ts`).
      Confirm: only the regions above changed; no UUID duplicated (search each new `c3000000-0003-...0000000000NN` and `ac000000-0013-...NN` once, in the constants only); no password or credential line changed; `update: {}` everywhere a new upsert appears; the existing storage-disabled edits are intact; no `@ts-ignore` added.
      Files: `backend/prisma/seed.ts`

- [ ] 8. Static verification (the ONLY verification; do NOT run the seed).
      - Required: run `npx tsc --noEmit` in `c:\Users\Dev\Desktop\Personal\LEAR\colegio-lear\backend` and expect exit code 0. CAVEAT, verified while planning: `backend/tsconfig.json` has `"include": ["src/**/*"]` and `rootDir ./src`, so the plain command does NOT type-check `prisma/seed.ts`. It only proves nothing else broke.
      - So also type-check the seed itself with a TEMPORARY config: create `backend/tsconfig.seedcheck.tmp.json` with `{ "extends": "./tsconfig.json", "compilerOptions": { "rootDir": ".", "noEmit": true }, "include": ["prisma/seed.ts", "src/**/*"] }`, run `npx tsc --noEmit -p tsconfig.seedcheck.tmp.json` in `backend`, expect exit code 0 (baseline was 0 before any change), then DELETE the temp file. Do not leave it in the repo.
      - Optionally `npx vitest run` is not relevant (no tests cover the seed); skip it.
      - The Supabase DB (`aws-0-us-west-2.pooler.supabase.com`) was unreachable from this machine in the earlier login investigation. Do NOT execute `npx prisma db seed` or any other DB command. If it is unreachable, verification stays static only. If the user later runs it against a reachable DB: `npx prisma db seed` from `backend/` is enough. No `migrate` and no `generate` is needed, since the schema is unchanged.

## 7. Expected seed output after the change (fresh DB; for the final summary)

- Teacher employees: 10 · Additional teacher employees: 7 · Administrative staff: 3.
- School subjects: 6 · School subjects (2026 dataset): 6 · School subjects (2026 enrichment): 34 (total catalog: 46).
- Academic cycle school subjects: 16 (primaria 8, preescolar 8) · Class schedule: 32 calendar entries.
- School subject tasks: 64 (32 group/subject pairs × 2; the attachment text in the log is already stale from the disabled storage edit, leave it).
- Student grades: 1728 on a fresh DB (36 primaria × 8 × 3 + 36 preescolar × 8 × 3). On the user's already-seeded DB a re-run adds only the missing rows: 756 (36×3×3 + 36×4×3).
- Chat messages: 576 on a fresh DB. On an already-seeded DB no new ones are added (known limitation).

## 8. Hard constraints checklist

- No edits to `schema.prisma`, no migrations, no new files kept in the repo (the temp tsconfig is deleted).
- No change to any password, hash, env var, `Estudiante123!`, `Docente123!` or `Admin789!` handling, nor to student codes `LR-2026-NNNN`.
- Idempotent: subjects and cycle subjects use `upsert` with `update: {}` on natural unique keys; employees upsert on `email`; calendar entries upsert on fixed `id`; grades use `createMany({ skipDuplicates })`; tasks keep their existing per-pair count guard.
- Do not commit or push unless the user asks.

## Verification
- `npx tsc --noEmit` (backend): exit 0.
- `npx tsc --noEmit -p` temp config including prisma/seed.ts (deleted afterwards): exit 0.
- Static: 62 fixed ids (46 c3000000 + 16 ac000000), all unique. No duplicate (name, educationLevel) pairs by construction. All new keys referenced exist (compiler-checked).
- Seed NOT executed (no DB run attempted); verified statically only.

## Verification (iteration 2)
- Restored the storageService upload blocks (task attachments, materials) in backend/prisma/seed.ts to their original form; git diff vs base 2fe7b5e shows no storage/material changes.
- Ran: npx tsc --noEmit in backend -> exit 0.
- Seed NOT executed (no DB run); idempotency of createMany skipDuplicates and calendar ids 19-32 verified statically only.
