/** Record returned from the student_allergies table */
export interface AllergyRecord {
  id: string;
  studentId: string;
  name: string;
  severity: string;
  observations: string | null;
}

/** Input DTO for creating a student allergy */
export interface CreateAllergyDto {
  name: string;
  severity: string;
  observations?: string;
}

/** Input DTO for updating a student allergy */
export interface UpdateAllergyDto {
  name?: string;
  severity?: string;
  observations?: string;
}
