import type { EducationLevel } from "./education-level";

/**
 * Niveles académicos
 */
export interface AcademicLevel {
    id: string;
    name: string;
    description: string;
    status: boolean;
    
    educationLevels: EducationLevel[]
}
