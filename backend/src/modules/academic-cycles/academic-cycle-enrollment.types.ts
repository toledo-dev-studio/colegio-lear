import type { AcademicCycleStatus } from "./academic-cycle.types";

export type AcademicCycleEnrollmentStatus = "enrolled" | "completed" | "dropped";

/** Filters applicable to academic cycle enrollment list endpoints (scoped by academicCycleId in the URL) */
export interface AcademicCycleEnrollmentFilters {
  q?: string;
  status?: AcademicCycleEnrollmentStatus;
  academicCycleSchoolGroupId?: string;
  scholarshipId?: string;
}

/** Record returned from the academic_cycle_enrollments table */
export interface AcademicCycleEnrollmentRecord {
  id: string;
  code: string;
  status: AcademicCycleEnrollmentStatus;
  observations: string | null;
  droppedNotes: string | null;
  studentId: string;
  student: {
    id: string;
    name: string;
    firstLastName: string;
    secondLastName: string;
    enrollment: string;
  };
  academicCycleId: string;
  academicCycle?: { id: string; name: string; status: AcademicCycleStatus };
  academicCycleSchoolGroupId: string;
  academicCycleSchoolGroup: { id: string; name: string };
  scholarshipId: string | null;
  scholarship: {
    id: string;
    name: string;
    discountPercentage: number;
  } | null;
  createdAt: string;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/** Input DTO for creating an academic cycle enrollment */
export interface CreateAcademicCycleEnrollmentDto {
  status?: AcademicCycleEnrollmentStatus;
  observations?: string;
  droppedNotes?: string;
  studentId: string;
  academicCycleSchoolGroupId: string;
  scholarshipId?: string;
}

/** Input DTO for updating an academic cycle enrollment */
export interface UpdateAcademicCycleEnrollmentDto {
  status?: AcademicCycleEnrollmentStatus;
  observations?: string | null;
  droppedNotes?: string | null;
  academicCycleSchoolGroupId?: string;
  scholarshipId?: string | null;
}
