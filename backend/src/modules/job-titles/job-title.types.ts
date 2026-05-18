/** Prisma enum values mapped to frontend-compatible strings */
export type JobTitleTypes = "teacher" | "administrative-staff";

/** Filters applicable to job title list endpoints */
export interface JobTitleFilters {
  q?: string;
  name?: string;
  jobTitleType?: JobTitleTypes;
  status?: boolean;
}

/** Record returned from the job_titles table (used for all responses) */
export interface JobTitleRecord {
  id: string;
  name: string;
  description: string;
  jobTitleType: JobTitleTypes;
  status: boolean;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/** Input DTO for creating a job title */
export interface CreateJobTitleDto {
  name: string;
  description: string;
  jobTitleType: JobTitleTypes;
}

/** Input DTO for updating a job title (all fields optional) */
export interface UpdateJobTitleDto {
  name?: string;
  description?: string;
  jobTitleType?: JobTitleTypes;
}
