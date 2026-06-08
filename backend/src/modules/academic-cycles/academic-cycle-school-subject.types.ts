/** Record returned from the academic_cycle_school_subjects table */
export interface AcademicCycleSchoolSubjectRecord {
  id: string;
  academicCycleId: string;
  schoolSubjectId: string;
  observations: string | null;
  schoolSubject: {
    id: string;
    name: string;
    description: string | null;
  };
}

/** Input DTO for creating an academic cycle school subject */
export interface CreateAcademicCycleSchoolSubjectDto {
  schoolSubjectId: string;
  observations?: string;
}

/** Input DTO for updating an academic cycle school subject */
export interface UpdateAcademicCycleSchoolSubjectDto {
  schoolSubjectId?: string;
  observations?: string | null;
}
