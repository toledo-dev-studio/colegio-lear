-- Create enum
CREATE TYPE core."PaymentMethod" AS ENUM ('online-payment', 'cash');

-- Create student_grades table (read-only for now, no write path in the admin app yet)
CREATE TABLE core.student_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade DECIMAL(4,2) NOT NULL,
  evaluation_number INTEGER NOT NULL,
  school_subject_id UUID NOT NULL REFERENCES core.school_subjects(id) ON DELETE RESTRICT,
  academic_cycle_enrollment_id UUID NOT NULL REFERENCES core.academic_cycle_enrollments(id) ON DELETE CASCADE,
  UNIQUE (academic_cycle_enrollment_id, school_subject_id, evaluation_number)
);

-- Create student_wallet_items table
-- Snapshotted from academic_cycle_wallet when a student enrolls (see
-- AcademicCycleEnrollmentService.create()). status is NOT stored here —
-- it's derived on read from outstanding_amount / is_forgiven / due_date /
-- extension_date.
CREATE TABLE core.student_wallet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  amount DECIMAL(10,2) NOT NULL,
  allow_forgiveness BOOLEAN NOT NULL DEFAULT false,
  outstanding_amount DECIMAL(10,2) NOT NULL,
  is_forgiven BOOLEAN NOT NULL DEFAULT false,
  extension_date TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  student_id UUID NOT NULL REFERENCES core.students(id) ON DELETE RESTRICT,
  academic_cycle_id UUID NOT NULL REFERENCES core.academic_cycles(id) ON DELETE CASCADE,
  academic_cycle_enrollment_id UUID NOT NULL REFERENCES core.academic_cycle_enrollments(id) ON DELETE CASCADE,
  academic_cycle_wallet_id UUID NOT NULL REFERENCES core.academic_cycle_wallet(id) ON DELETE RESTRICT
);

-- Create student_wallet_payments table
CREATE TABLE core.student_wallet_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(20) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method core."PaymentMethod" NOT NULL,
  academic_cycle_id UUID NOT NULL REFERENCES core.academic_cycles(id) ON DELETE CASCADE,
  academic_cycle_enrollment_id UUID NOT NULL REFERENCES core.academic_cycle_enrollments(id) ON DELETE CASCADE,
  student_wallet_item_id UUID NOT NULL REFERENCES core.student_wallet_items(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
