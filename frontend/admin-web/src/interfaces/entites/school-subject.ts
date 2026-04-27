import type { AcademicLevel } from "./academic-level";
import type { EducationLevel } from "./education-level";

/**
 * Materias escolares
 */
export interface SchoolSubject {
    id: string;
    name: string;
    description: string;
    status:  boolean;
    
    academicLevelId: string;
    academicLevel?: AcademicLevel;

    educationLevelId: string;
    educationLevel: EducationLevel;
}

