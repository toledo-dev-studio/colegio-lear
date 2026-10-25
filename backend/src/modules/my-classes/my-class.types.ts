import type { AcademicCycleSchoolGroupStatus } from "../academic-cycles/academic-cycle-school-group.types";
import type { AcademicCycleStatus } from "../academic-cycles/academic-cycle.types";

/** Filters applicable to the "my classes" list endpoints */
export interface MyClassFilters {
  q?: string;
  name?: string;
  status?: AcademicCycleSchoolGroupStatus;
  academicCycleStatus?: AcademicCycleStatus;
}

/** Minimal academic cycle info embedded in a MyClassRecord */
export interface MyClassAcademicCycleRecord {
  id: string;
  name: string;
  code: string;
  periodType: string;
  status: AcademicCycleStatus;
  minimumPassingGrade: number;
  evaluationCount: number;
  startDate: string;
  endDate: string;
}

/**
 * A class (academic cycle school group) assigned to the authenticated
 * teacher, resolved through AcademicCycleGroupCalendar.teacherId — never a
 * direct FK on the group itself, since a group has many teachers (one per
 * subject taught) and this is the teacher's own view of "my classes".
 */
export interface MyClassRecord {
  id: string;
  name: string;
  status: AcademicCycleSchoolGroupStatus;
  academicCycle?: MyClassAcademicCycleRecord;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
