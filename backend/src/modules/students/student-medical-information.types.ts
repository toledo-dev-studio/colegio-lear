/** Allergy record nested within medical information */
export interface AllergyRecord {
  id: string;
  name: string;
  severity: string;
  observations: string | null;
}

/** Medical information record returned from the API */
export interface StudentMedicalInformationRecord {
  id: string;
  studentId: string;
  bloodType: string;
  emergencyNotes: string | null;
  allergies: AllergyRecord[];
}

/** Input DTO for allergy */
export interface AllergyInput {
  id?: string;
  name: string;
  severity: string;
  observations?: string;
}

/** Input DTO for upserting medical information */
export interface UpsertMedicalInformationDto {
  bloodType: string;
  emergencyNotes?: string;
  allergies?: AllergyInput[];
}
