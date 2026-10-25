import type { StudentGuardianRelationshipKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Response
 * Description: Represents a guardian of a student, containing their personal information, relationship to the student, contact details, and other relevant information.
 */
export interface StudentGuardianResponse {
    /**
     * Guardian unique identifier
     */
    id: string;
    /**
     * Student unique identifier
     */
    studentId: string;
    /**
     * Full name of the guardian
     */
    fullName: string;
    /**
     * Relationship to the student (e.g., "Father", "Mother", "Guardian", etc.)
     */
    relationship: StudentGuardianRelationshipKey;
    /**
     * Contact phone number for the guardian
     */
    phoneNumber: string;
    /**
     * Contact email for the guardian
     */
    email: string;
    /**
     * Indicates if this guardian is the primary contact
     */
    isPrincipal: boolean;
    /**
     * Indicates if this guardian should be contacted in case of emergency
     */
    emergencyContact: boolean;
    /**
     * Indicates if this guardian is authorized to pick up the student
     */
    authorizedToPickUp: boolean;
    /**
     * Additional notes about the guardian
     */
    observations?: string;
}