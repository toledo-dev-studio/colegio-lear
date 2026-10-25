-- Add password and must_change_password columns to students
ALTER TABLE core.students ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE core.students ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT true;
