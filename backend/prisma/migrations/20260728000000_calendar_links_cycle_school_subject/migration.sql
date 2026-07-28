-- Calendar entries used to reference the global school_subjects catalog
-- directly, which let a class be scheduled for a subject that was never
-- added to that specific academic cycle's subject list. From now on a
-- calendar entry references the cycle's own catalog association
-- (academic_cycle_school_subjects) instead.

-- 1) Auto-heal any calendar row whose (academic_cycle_id, school_subject_id)
--    pair isn't already in the cycle's subject catalog, by inserting the
--    missing association row(s) first.
INSERT INTO core.academic_cycle_school_subjects (id, academic_cycle_id, school_subject_id)
SELECT gen_random_uuid(), pairs.academic_cycle_id, pairs.school_subject_id
FROM (
  SELECT DISTINCT cal.academic_cycle_id, cal.school_subject_id
  FROM core.academic_cycle_group_calendars cal
  WHERE NOT EXISTS (
    SELECT 1 FROM core.academic_cycle_school_subjects acs
    WHERE acs.academic_cycle_id = cal.academic_cycle_id
      AND acs.school_subject_id = cal.school_subject_id
  )
) pairs;

-- 2) Add the new column (nullable for now, to allow backfill).
ALTER TABLE core.academic_cycle_group_calendars ADD COLUMN "academic_cycle_school_subject_id" UUID;

-- 3) Backfill: point each calendar row at its matching cycle-subject association.
UPDATE core.academic_cycle_group_calendars cal
SET academic_cycle_school_subject_id = acs.id
FROM core.academic_cycle_school_subjects acs
WHERE acs.academic_cycle_id = cal.academic_cycle_id
  AND acs.school_subject_id = cal.school_subject_id;

-- 4) Enforce NOT NULL now that every row has a value.
ALTER TABLE core.academic_cycle_group_calendars ALTER COLUMN "academic_cycle_school_subject_id" SET NOT NULL;

-- 5) Swap the foreign key: drop the old one (-> school_subjects) and the old
--    column, add the new one (-> academic_cycle_school_subjects).
ALTER TABLE core.academic_cycle_group_calendars DROP CONSTRAINT "academic_cycle_group_calendars_school_subject_id_fkey";
ALTER TABLE core.academic_cycle_group_calendars DROP COLUMN "school_subject_id";
ALTER TABLE core.academic_cycle_group_calendars
  ADD CONSTRAINT "academic_cycle_group_calendars_academic_cycle_school_subject_id_fkey"
  FOREIGN KEY ("academic_cycle_school_subject_id") REFERENCES core.academic_cycle_school_subjects(id) ON DELETE RESTRICT;
