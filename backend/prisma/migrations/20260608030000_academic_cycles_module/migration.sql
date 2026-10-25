-- Create enums
CREATE TYPE core."AcademicPeriodType" AS ENUM ('annual', 'semester', 'four-month-period', 'trimester', 'bimester', 'monthly', 'intensive', 'special');
CREATE TYPE core."AcademicCycleStatus" AS ENUM ('upcoming', 'active', 'completed', 'cancelled', 'archived');

-- Create academic_cycles table
CREATE TABLE core.academic_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  type core."AcademicPeriodType" NOT NULL,
  status core."AcademicCycleStatus" NOT NULL DEFAULT 'upcoming',
  enrollment_open BOOLEAN NOT NULL DEFAULT false,
  description VARCHAR(500),
  observations VARCHAR(1000),
  academic_level_id UUID NOT NULL REFERENCES core.academic_levels(id) ON DELETE RESTRICT,
  education_level_id UUID NOT NULL REFERENCES core.education_levels(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create academic_cycle_school_subjects table
CREATE TABLE core.academic_cycle_school_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_cycle_id UUID NOT NULL REFERENCES core.academic_cycles(id) ON DELETE CASCADE,
  school_subject_id UUID NOT NULL REFERENCES core.school_subjects(id) ON DELETE RESTRICT,
  observations VARCHAR(500),
  UNIQUE(academic_cycle_id, school_subject_id)
);

-- Create academic_cycle_wallet table
CREATE TABLE core.academic_cycle_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_cycle_id UUID NOT NULL REFERENCES core.academic_cycles(id) ON DELETE CASCADE,
  payment_concept_id UUID NOT NULL REFERENCES core.payment_concepts(id) ON DELETE RESTRICT,
  due_date TIMESTAMP NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  allow_forgiveness BOOLEAN NOT NULL DEFAULT false
);

-- Create academic_cycle_groups table
CREATE TABLE core.academic_cycle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  status BOOLEAN NOT NULL DEFAULT true,
  description VARCHAR(500),
  academic_cycle_id UUID NOT NULL REFERENCES core.academic_cycles(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
