import type { AllergySeverityKey, KeyValuePair } from "@/types/KeyValuePair";

/**
 * ALLERGY_SEVERITIES defines the possible severity levels for allergies, which can be used to categorize the severity of a student's allergy. 
 * Each severity level has a key and a label for display purposes.
 */
export const ALLERGY_SEVERITIES: KeyValuePair<AllergySeverityKey>[] = [
    { key: "mild", label: "Leve" },
    { key: "moderate", label: "Moderada" },
    { key: "severe", label: "Severa" },
];

/**
 * Represents an allergy that a student may have, containing details about the allergy's name, severity, and any additional observations. This information can be used to ensure the safety and well-being of the student while at school.
 */
export interface Allergy {
    /**
     * Required - Allergy unique identifier
     */
    id: string;
    /**
     * Required - Name of the allergy (e.g., "Peanuts", "Pollen", etc.)
     */
    name: string;
    /**
     * Required - Severity of the allergy (e.g., "mild", "moderate", "severe")
     */
    severity: AllergySeverityKey;
    /**
     * Optional - Additional notes about the allergy
     */
    observations?: string;
}
