/** Filters applicable to list endpoints */
export interface SubjectFilters {
  q?: string;
  name?: string;
  isActive?: boolean;
  academicLevelId?: string;
  educationLevelId?: string;
}

/** Row returned from the v_school_subjects view */
export interface SubjectView {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  academicLevelId: string;
  academicLevel: {
    id: string;
    name: string;
  };
  educationLevelId: string;
  educationLevel: {
    id: string;
    name: string;
  };
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/** Input DTO for creating a subject */
export interface CreateSchoolSubjectDto {
  name: string;
  description?: string;
  academicLevelId: string;
  educationLevelId: string;
  isActive?: boolean;
}

/** Input DTO for updating a subject (all fields optional) */
export interface UpdateSchoolSubjectDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  academicLevelId?: string;
  educationLevelId?: string;
}

/** Record returned after write operations (from table, not view) */
export interface SchoolSubjectRecord {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  academicLevelId: string;
  educationLevelId: string;
}
