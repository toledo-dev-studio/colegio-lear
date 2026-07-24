-- phoneNumber/email are only required for the principal guardian; make
-- both columns nullable so non-principal guardians can omit them.
ALTER TABLE core.student_guardians ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE core.student_guardians ALTER COLUMN email DROP NOT NULL;
