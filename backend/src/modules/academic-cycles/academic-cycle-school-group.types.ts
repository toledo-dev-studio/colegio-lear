import type { EmployeeRecord } from "../employees/employee.types";

export type AcademicCycleSchoolGroupStatus = "active" | "discharged";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/** Record returned from the academic_cycle_group_calendars table */
export interface AcademicCycleSchoolGroupCalendarRecord {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  academicCycleId: string;
  academicCycleSchoolGroupId: string;
  schoolSubjectId: string;
  schoolSubject: { id: string; name: string; description: string | null };
  teacherId: string;
  teacher: EmployeeRecord;
}

/** Record returned from the academic_cycle_groups table */
export interface AcademicCycleSchoolGroupRecord {
  id: string;
  name: string;
  status: AcademicCycleSchoolGroupStatus;
  description: string | null;
  dischargedDescription: string | null;
  academicCycleId: string;
  calendars?: AcademicCycleSchoolGroupCalendarRecord[];
}

/**
 * Calendar entry as received inside the group's create/update body.
 * `id` absent or prefixed with "new_" (or "new-") means create; a real
 * existing UUID means update; any existing calendar id not present in the
 * incoming array is deleted (same 1:N sync pattern as `education-levels`).
 */
export interface AcademicCycleSchoolGroupCalendarInput {
  id?: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  schoolSubjectId: string;
  teacherId: string;
}

/** Input DTO for creating an academic cycle school group */
export interface CreateAcademicCycleSchoolGroupDto {
  name: string;
  status?: AcademicCycleSchoolGroupStatus;
  description?: string;
  dischargedDescription?: string;
  calendars?: AcademicCycleSchoolGroupCalendarInput[];
}

/** Input DTO for updating an academic cycle school group */
export interface UpdateAcademicCycleSchoolGroupDto {
  name?: string;
  status?: AcademicCycleSchoolGroupStatus;
  description?: string | null;
  dischargedDescription?: string | null;
  calendars?: AcademicCycleSchoolGroupCalendarInput[];
}

/** Derived (not its own table) distinct subject/teacher pairs for a group */
export interface AcademicCycleSchoolGroupTeacherRecord {
  schoolSubjectId: string;
  schoolSubject: { id: string; name: string; description: string | null };
  /** This academic cycle's own subject catalog entry id — see teacher-class-scope.helper.ts for why callers need this alongside the plain schoolSubjectId. */
  academicCycleSchoolSubjectId: string;
  teacherId: string;
  teacher: EmployeeRecord;
}
