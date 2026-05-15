/**
 * Filters applicable to academic levels list endpoints.
 */
export interface AcademicLevelFilters {
  q?: string;
  name?: string;
  status?: boolean;
}

/**
 * Row returned from the v_academic_levels view.
 */
export interface AcademicLevelView {
  id: string;
  name: string;
  description: string;
  status: boolean;
}

/**
 * Education level as returned in responses.
 */
export interface EducationLevelView {
  id: string;
  name: string;
  description: string | null;
  academicLevelId: string;
}

/**
 * Detail response for findById (includes education levels).
 */
export interface AcademicLevelDetail {
  id: string;
  name: string;
  description: string;
  status: boolean;
  educationLevels: EducationLevelView[];
}

/**
 * Filters applicable to education levels paged endpoint.
 */
export interface EducationLevelFilters {
  q?: string;
  status?: boolean;
  academicLevelId?: string;
}

/**
 * Result of a paginated query.
 */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/**
 * Input DTO for creating an academic level.
 */
export interface CreateAcademicLevelDto {
  name: string;
  description: string;
}

/**
 * Input DTO for updating an academic level (all fields optional).
 */
export interface UpdateAcademicLevelDto {
  name?: string;
  description?: string;
}

/**
 * Record returned after write operations (from table).
 */
export interface AcademicLevelRecord {
  id: string;
  name: string;
  description: string;
  status: boolean;
}
