import type { BloodTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Request
 * Description: Represents a student enrolled in the school, containing their personal information, contact details, medical information, and guardians.
 */
export interface StudentRequest {
    /**
     * Name(s) of the student
     */
    name: string;
    /**
     * First last name of the student
     */
    firstLastName: string;
    /**
     * Second last name of the student
     */
    secondLastName: string;
    /**
     * Date of birth as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    dateOfBirth: string;
    /**
     * Unique population registration number
     */
    curp: string;
    /**
     * URL to the student's image
     */
    image?: string;
    /**
     * Additional notes about the student
     */
    observations?: string;
    /**
     * Indicates if the student is active
     */
    isActive: boolean;
    /**
     * Indicates the student's blood type
     */
    bloodType: BloodTypeKey;
    /**
     * Addicional medical notes
     */
    medicalNotes?: string;
    /**
     * Contact email for the student
     */
    email: string;
    /**
     * Contact phone number for the student
     */
    phoneNumber: string;
    /**
     * Full address as a single string
     */
    address: string;
    /**
     * State or province
     */
    state: string;
    /**
     * Municipality or city
     */
    municipality: string;
    /**
     * Postal code
     */
    postalCode: string;
}
