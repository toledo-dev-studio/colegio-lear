import type { AllergySeverityKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Response
 * Description: Represents an allergy that a student may have, containing details about the allergy's name, severity, and any additional observations. This information can be used to ensure the safety and well-being of the student while at school.
 */
export interface AllergyResponse {
    /**
     * Allergy unique identifier
     */
    id: string;
    /**
     * Name of the allergy (e.g., "Peanuts", "Pollen", etc.)
     */
    name: string;
    /**
     * Severity of the allergy (e.g., "mild", "moderate", "severe")
     */
    severity: AllergySeverityKey;
    /**
     * Additional notes about the allergy
     */
    observations?: string;
    /**
     * Related student unique identifier
     */
    studentId: string;
}
