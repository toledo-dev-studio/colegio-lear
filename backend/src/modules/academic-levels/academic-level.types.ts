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
  description: string | null;
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
  description: string | null;
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
 * Optionally includes education levels to create in the same transaction.
 */
export interface CreateAcademicLevelDto {
  name: string;
  description?: string;
  educationLevels?: EducationLevelInput[];
}

/**
 * Input DTO for updating an academic level (all fields optional).
 * Includes educationLevels for sync (create new, update existing, delete removed).
 */
export interface UpdateAcademicLevelDto {
  name?: string;
  description?: string;
  status?: boolean;
  educationLevels?: EducationLevelInput[];
}

/**
 * Input for an education level within the academic level create/update.
 * If id starts with "new-" it's a new record; otherwise it's an existing one to update.
 */
export interface EducationLevelInput {
  id: string;
  name: string;
  description?: string;
}

/**
 * Record returned after write operations (from table).
 */
export interface AcademicLevelRecord {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
}
