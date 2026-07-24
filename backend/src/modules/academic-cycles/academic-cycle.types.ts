/** Allowed academic period types (frontend values) */
export type AcademicPeriodType =
  | "annual"
  | "semester"
  | "four-month-period"
  | "trimester"
  | "bimester"
  | "monthly"
  | "intensive"
  | "special";

/** Allowed academic cycle statuses */
export type AcademicCycleStatus =
  | "upcoming"
  | "active"
  | "completed"
  | "cancelled"
  | "archived";

/** Filters applicable to academic cycle list endpoints */
export interface AcademicCycleFilters {
  q?: string;
  name?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  periodType?: AcademicPeriodType;
  enrollmentOpen?: boolean;
  status?: AcademicCycleStatus;
}

/** Record returned from the academic_cycles table */
export interface AcademicCycleRecord {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  periodType: AcademicPeriodType;
  status: AcademicCycleStatus;
  minimumPassingGrade: number;
  evaluationCount: number;
  enrollmentOpen: boolean;
  observations: string | null;
  academicLevelId: string;
  educationLevelId: string;
  academicLevel: { id: string; name: string };
  educationLevel: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/** Input DTO for creating an academic cycle */
export interface CreateAcademicCycleDto {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  periodType: AcademicPeriodType;
  status?: AcademicCycleStatus;
  minimumPassingGrade?: number;
  evaluationCount?: number;
  enrollmentOpen?: boolean;
  observations?: string;
  academicLevelId: string;
  educationLevelId: string;
}

/** Input DTO for updating an academic cycle (all fields optional) */
export interface UpdateAcademicCycleDto {
  name?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  periodType?: AcademicPeriodType;
  status?: AcademicCycleStatus;
  minimumPassingGrade?: number;
  evaluationCount?: number;
  enrollmentOpen?: boolean;
  observations?: string | null;
  academicLevelId?: string;
  educationLevelId?: string;
}
