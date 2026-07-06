/**
 * Type: Request
 * Description: Represents a payment concept associated with a student's wallet for a specific academic cycle, containing details about the payment, its status, and references to related entities.
 */
export interface StudentWalletItemRequest {
    /**
     * Indicates if forgiveness is allowed for the payment associated with the academic cycle wallet
     */
    allowForgiveness: boolean;
    /**
     * Indicates if the payment associated with the student wallet has been forgiven.
     */
    isForgiven?: boolean;
    /**
     * Date when the payment associated with the student wallet is extended
     */
    extensionDate?: string;
}
