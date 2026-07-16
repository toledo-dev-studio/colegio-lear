-- Rename column type → period_type in academic_cycles table (aligns with frontend field name)
ALTER TABLE core.academic_cycles RENAME COLUMN type TO period_type;

-- Add grading configuration fields used by the frontend but missing from the schema
ALTER TABLE core.academic_cycles ADD COLUMN minimum_passing_grade INTEGER NOT NULL DEFAULT 6;
ALTER TABLE core.academic_cycles ADD COLUMN evaluation_count INTEGER NOT NULL DEFAULT 3;
