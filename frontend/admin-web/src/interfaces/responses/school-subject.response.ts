import type { AcademicLevelResponse } from "./academic-level.response";
import type { EducationLevelResponse } from "./education-level.response";

/**
 * Materias escolares
 */
export interface SchoolSubject {
    id: string;
    name: string;
    description: string;
    status:  boolean;
    academicLevel: AcademicLevelResponse
    educationLevelId: EducationLevelResponse
}
