/** Filters applicable to scholarship list endpoints */
export interface ScholarshipFilters {
  q?: string;
  name?: string;
  status?: boolean;
  discountPercentage?: number;
}

/** Record returned from the scholarships table (used for all responses) */
export interface ScholarshipRecord {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  status: boolean;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/** Input DTO for creating a scholarship */
export interface CreateScholarshipDto {
  name: string;
  description: string;
  discountPercentage: number;
}

/** Input DTO for updating a scholarship (all fields optional) */
export interface UpdateScholarshipDto {
  name?: string;
  description?: string;
  discountPercentage?: number;
}
