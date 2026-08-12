import type { AcademicCycleEnrollmentResponse } from "./academic-cycle-enrollment.response";

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
   * List of enrollments (inscriptions) of the student, each one associated to a single academic cycle
   */
  enrollments: AcademicCycleEnrollmentResponse[];
}
