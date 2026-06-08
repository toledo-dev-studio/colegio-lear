/** Filters applicable to student list endpoints */
export interface StudentFilters {
  q?: string;
  name?: string;
  curp?: string;
  enrollment?: string;
  email?: string;
  phoneNumber?: string;
  status?: boolean;
}

/** Record returned from the students table */
export interface StudentRecord {
  id: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  dateOfBirth: string;
  curp: string;
  enrollment: string;
  image: string | null;
  observations: string | null;
  status: boolean;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  municipality: string;
  postalCode: string;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/** Input DTO for creating a student */
export interface CreateStudentDto {
  name: string;
  firstLastName: string;
  secondLastName: string;
  dateOfBirth: string;
  curp: string;
  image?: string;
  observations?: string;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  municipality: string;
  postalCode: string;
}

/** Input DTO for updating a student (all fields optional) */
export interface UpdateStudentDto {
  name?: string;
  firstLastName?: string;
  secondLastName?: string;
  dateOfBirth?: string;
  curp?: string;
  image?: string;
  observations?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  state?: string;
  municipality?: string;
  postalCode?: string;
  status?: boolean;
}
