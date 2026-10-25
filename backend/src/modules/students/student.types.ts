/** Blood type key, matches the frontend's BloodTypeKey format exactly ("A+", "O-", etc.) */
export type BloodTypeKey =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

/** Filters applicable to student list endpoints */
export interface StudentFilters {
  q?: string;
  fullName?: string;
  curp?: string;
  enrollment?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
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
  avatar: string | null;
  observations: string | null;
  isActive: boolean;
  bloodType: BloodTypeKey;
  medicalNotes: string | null;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  municipality: string;
  postalCode: string;
}

/** File upload data passed from controller to service */
export interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
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
  avatar?: string;
  observations?: string;
  bloodType: BloodTypeKey;
  medicalNotes?: string;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  municipality: string;
  postalCode: string;
  isActive?: boolean;
}

/** Input DTO for updating a student (all fields optional) */
export interface UpdateStudentDto {
  name?: string;
  firstLastName?: string;
  secondLastName?: string;
  dateOfBirth?: string;
  curp?: string;
  avatar?: string;
  observations?: string;
  bloodType?: BloodTypeKey;
  medicalNotes?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  state?: string;
  municipality?: string;
  postalCode?: string;
  isActive?: boolean;
}
