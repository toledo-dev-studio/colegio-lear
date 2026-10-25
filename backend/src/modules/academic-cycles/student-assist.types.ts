/** Attendance status key, matches the frontend's AssistStatusKey exactly. */
export type AssistStatusKey = "present" | "absent";

/** Record returned from the student_assists table */
export interface StudentAssistRecord {
  id: string;
  academicCycleEnrollmentId: string;
  assistDate: string;
  status: AssistStatusKey;
  absenceReason: string | null;
}

/** Date-range filters applicable to the assists list endpoint */
export interface StudentAssistFilters {
  fromDate?: string;
  toDate?: string;
}

/** Input DTO for creating an attendance record for a single day */
export interface CreateStudentAssistDto {
  assistDate: string;
  status: AssistStatusKey;
  absenceReason?: string;
}

/** Input DTO for updating an attendance record */
export interface UpdateStudentAssistDto {
  status?: AssistStatusKey;
  absenceReason?: string | null;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
