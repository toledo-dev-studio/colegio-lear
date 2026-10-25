-- Create enums
CREATE TYPE core."AcademicCycleSchoolGroupStatus" AS ENUM ('active', 'discharged');
CREATE TYPE core."DayOfWeek" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- academic_cycle_groups: status boolean -> enum, add discharged_description
ALTER TABLE core.academic_cycle_groups ADD COLUMN status_new core."AcademicCycleSchoolGroupStatus" NOT NULL DEFAULT 'active';
UPDATE core.academic_cycle_groups SET status_new = CASE WHEN status THEN 'active' ELSE 'discharged' END::core."AcademicCycleSchoolGroupStatus";
ALTER TABLE core.academic_cycle_groups DROP COLUMN status;
ALTER TABLE core.academic_cycle_groups RENAME COLUMN status_new TO status;
ALTER TABLE core.academic_cycle_groups ADD COLUMN discharged_description VARCHAR(500);

-- Create academic_cycle_group_calendars table
CREATE TABLE core.academic_cycle_group_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day core."DayOfWeek" NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  academic_cycle_id UUID NOT NULL REFERENCES core.academic_cycles(id) ON DELETE CASCADE,
  academic_cycle_school_group_id UUID NOT NULL REFERENCES core.academic_cycle_groups(id) ON DELETE CASCADE,
  school_subject_id UUID NOT NULL REFERENCES core.school_subjects(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES core.employees(id) ON DELETE RESTRICT
);
