/** Record returned from the student_guardians table */
export interface StudentGuardianRecord {
  id: string;
  studentId: string;
  fullName: string;
  relationship: string;
  phoneNumber: string | null;
  email: string | null;
  isPrincipal: boolean;
  emergencyContact: boolean;
  authorizedToPickUp: boolean;
  observations: string | null;
}

/**
 * Input DTO for creating a student guardian.
 * phoneNumber/email are only required when isPrincipal is true — enforced
 * by createStudentGuardianSchema, not by this type.
 */
export interface CreateStudentGuardianDto {
  fullName: string;
  relationship: string;
  phoneNumber?: string;
  email?: string;
  isPrincipal?: boolean;
  emergencyContact?: boolean;
  authorizedToPickUp?: boolean;
  observations?: string;
}

/** Input DTO for updating a student guardian */
export interface UpdateStudentGuardianDto {
  fullName?: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
  isPrincipal?: boolean;
  emergencyContact?: boolean;
  authorizedToPickUp?: boolean;
  observations?: string;
}
