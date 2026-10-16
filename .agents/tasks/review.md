# Enriched 2026 school subjects in the Prisma seed

The seed grows from 12 to 46 subjects. Primaria 1° and Preescolar 1° get 3 and 4 new subjects (8 each in total). Those are fully wired into the cycle, teacher, calendar and grade structures. Preescolar 2°, Primaria 2°, Secundaria 1° and Secundaria 2° get catalog-only subjects, because no 2026 cycle structures exist for them. Seven new teachers, 14 calendar slots per group pair and an idempotent grade pass were added. Only `backend/prisma/seed.ts` changed (base 2fe7b5e to HEAD).

Watch for: the seed was never executed against a DB, only typechecked (confirmed, plan.md Verification and iteration 2). Nothing blocking was found.

**Verdict**: APPROVED

## High-level view

Subjects are added through a single `ENRICHMENT_SUBJECTS` array that upserts on `(name, educationLevelId)` with `update: {}`. Fixed ids come from the extended `SCHOOL_SUBJECTS` map, so a re-run is a no-op.

Only Primaria 1° and Preescolar 1° have cycles, groups and students. Those seven subjects get `ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026` ids and seven extra teachers, and they are scheduled in a second time slot (10:00/11:00) appended after the original calendar loops. Existing calendar ids 1-18 stay stable; the new ones are 19-32. Grades now use `createMany` with `skipDuplicates`, so a re-run adds grades for the new subjects on already-seeded enrollments. The other levels are catalog-only, which is the only option without a cycle for them.

<details>
<summary>Issues (2)</summary>

1. **Seed never run (likely low risk)** — only `tsc --noEmit` was run. Run `prisma db seed` twice against a dev DB before relying on it.
2. **Grade seeding behavior change (possible, non-blocking)** — grades moved from "skip if any exist" to `createMany` with `skipDuplicates`. This is intentional and backed by the `@@unique([academicCycleEnrollmentId, schoolSubjectId, evaluationNumber])` constraint, but it changes semantics for existing enrollments.

</details>

<details>
<summary>Details</summary>

## Checks requested

UUIDs (a): 34 new `c3000000-0003-...` ids (13-46) and 7 new `ac000000-0013-...` ids (10-16). A scripted scan of the added lines found 41 UUIDs, all unique, and no duplicate UUID anywhere in the file. The format is valid.

Name/level pairs (b): names repeat only across different education levels (e.g. Español in 2pe, 2p, 1s, 2s). Within a level every name is distinct, and the upsert key is `(name, educationLevelId)`.

Wiring, traced end to end (c): `musica_1pe` has a `SCHOOL_SUBJECTS` id, an `ENRICHMENT_SUBJECTS` row for Preescolar 1°, and a cycle-subject entry `preescolar_musica_1pe`. It has a teacher (Daniela Rangel, groups preescolar_a/b), a Wednesday slot in `PREESCOLAR_SCHEDULE_SLOT2`, and the key appears in `PREESCOLAR_SUBJECT_KEYS`, which drives grades. The `educacion_fisica_1p` chain is the same for Primaria (teacher Óscar Beltrán, Tuesday slot 2). `findTeacher` throws if a teacher is missing, so a wiring gap would fail loudly. Students get the subjects through the group calendar and grades.

Idempotency (d): subjects, cycle subjects, employees (upsert by email), and calendar entries (upsert by fixed id) all use `update: {}`. Grades use `skipDuplicates`. No plain create remains.

Console counts (e): the enrichment log uses `ENRICHMENT_SUBJECTS.length` and `Object.keys(SCHOOL_SUBJECTS).length`, and the additional-teachers log uses the array length. Both are computed, so they can't drift.

Scope (f): one file changed. The iteration-2 commit reverted the earlier out-of-scope storage comment-out. The diff shows no storage, schema, migration or credential changes. Extra teachers reuse the existing teacher password variable, and their emails and phones (`55100` + 20000+n) don't collide with teachers or admin staff (`55200`). The uncommitted auth changes in the working tree are a separate task, not part of this commit.

Typecheck (g): `tsc --noEmit` exited 0 twice, including a temporary config that includes `prisma/seed.ts`.

## Teacher list kept separate

`EXTRA_TEACHERS_2026` is processed after admin staff so existing email sequence numbers stay stable. The `resolvedTeachers` type was narrowed to a structural type so both arrays fit.

</details>

<details>
<summary>File map</summary>

- `backend/prisma/seed.ts` — new subjects, cycle subjects, extra teachers, slot-2 calendar, idempotent grades. Full diff: `git diff 2fe7b5e HEAD`.

</details>
