import type { KeyValuePair, StudentGuardianTypeKey } from "@/lib/key-value-pairs/key-value-pair";

/**
 * STUDENT_GUARDIANS defines the possible relationships a guardian can have with a student, along with their display labels.
 */
export const STUDENT_GUARDIANS: KeyValuePair<StudentGuardianTypeKey>[] = [
    { key: "father", label: "Padre" },
    { key: "mother", label: "Madre" },
    { key: "grandmother", label: "Abuela" },
    { key: "grandfather", label: "Abuelo" },
    { key: "uncle", label: "Tío" },
    { key: "aunt", label: "Tía" },
    { key: "brother", label: "Hermano" },
    { key: "sister", label: "Hermana" },
    { key: "legal-guardian", label: "Tutor legal" },
    { key: "step-father", label: "Padrastro" },
    { key: "step-mother", label: "Madrastra" },
    { key: "other", label: "Otro" },
];

/**
 * Represents a guardian of a student, containing their personal information, relationship to the student, contact details, and other relevant information.
 */
export interface StudentGuardian {
    /**
     * Required - Guardian unique identifier
     */
    id: string;
    /**
     * Required - Student unique identifier
     */
    studentId: string;
    /**
     * Required - Full name of the guardian
     */
    fullName: string;
    /**
     * Required - Relationship to the student (e.g., "Father", "Mother", "Guardian", etc.)
     */
    relationship: StudentGuardianTypeKey;
    /**
     * Required - Contact phone number for the guardian
     */
    phoneNumber: string;
    /**
     * Required - Contact email for the guardian
     */
    email: string;
    /**
     * Required - Indicates if this guardian is the primary contact
     */
    isPrincipal: boolean;
    /**
     * Required - Indicates if this guardian should be contacted in case of emergency
     */
    emergencyContact: boolean;
    /**
     * Required - Indicates if this guardian is authorized to pick up the student
     */
    authorizedToPickUp: boolean;
    /**
     * Optional - Additional notes about the guardian
     */
    observations?: string;
}
