-- Create enum
CREATE TYPE core."AcademicCycleEnrollmentStatus" AS ENUM ('enrolled', 'completed', 'dropped');

-- Create academic_cycle_enrollments table
CREATE TABLE core.academic_cycle_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  status core."AcademicCycleEnrollmentStatus" NOT NULL DEFAULT 'enrolled',
  observations VARCHAR(1000),
  dropped_notes VARCHAR(1000),
  student_id UUID NOT NULL REFERENCES core.students(id) ON DELETE RESTRICT,
  academic_cycle_id UUID NOT NULL REFERENCES core.academic_cycles(id) ON DELETE CASCADE,
  academic_cycle_school_group_id UUID NOT NULL REFERENCES core.academic_cycle_groups(id) ON DELETE RESTRICT,
  scholarship_id UUID REFERENCES core.scholarships(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
