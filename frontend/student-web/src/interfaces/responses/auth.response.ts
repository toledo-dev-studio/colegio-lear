import type { AcademicCycleResponse } from "./academic-cycle.response";

/**
 * Interface to use it as auth response in the app
 */
export interface AuthResponse {
  /**
   * Student record unique identifier
   */
  id: string;
  /**
   * Student auth full name
   */
  fullName: string;
  /**
   * Student auth enrollment
   */
  enrollment: string;
  /**
   * Student auth email address
   */
  email: string;
  /**
   * URL of the student's profile image. This field can be used to store a link to an image hosted on a cloud storage service or a local server
   */
  avatar?: string;
  /**
   * Student is active flag
   */
  isActive?: boolean;
  /**
   * Flag to indicate if user must change password for a reset password request
   */
  mustChangePassword: boolean;
  /**
   * List of academic cycles where student is enrolled
   */
  academicCycles: AcademicCycleResponse[];
}
