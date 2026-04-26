import type { EducationLevelResponse } from "./education-level.response";

/**
 * Niveles académicos
 */
export interface AcademicLevelResponse {
    id: string;
    name: string;
    description: string;
    status: boolean;
    educationLevels: EducationLevelResponse[]
}
