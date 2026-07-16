-- Move bloodType/medicalNotes from student_medical_information directly onto
-- students, repoint student_allergies to reference students directly, and
-- drop the now-obsolete student_medical_information table (front sends/reads
-- bloodType and medicalNotes as flat fields on the student, and allergies as
-- their own sub-resource under /students/:studentId/allergies).

-- Rename status → is_active on students
ALTER TABLE core.students RENAME COLUMN status TO is_active;

-- Add bloodType and medicalNotes directly to students
ALTER TABLE core.students ADD COLUMN blood_type core."BloodType" NOT NULL;
ALTER TABLE core.students ADD COLUMN medical_notes VARCHAR(1000);

-- Repoint student_allergies to students directly
ALTER TABLE core.student_allergies DROP CONSTRAINT student_allergies_medical_information_id_fkey;
ALTER TABLE core.student_allergies RENAME COLUMN medical_information_id TO student_id;
ALTER TABLE core.student_allergies ADD CONSTRAINT student_allergies_student_id_fkey FOREIGN KEY (student_id) REFERENCES core.students(id) ON DELETE CASCADE;

-- Drop the now-obsolete student_medical_information table
DROP TABLE core.student_medical_information;
