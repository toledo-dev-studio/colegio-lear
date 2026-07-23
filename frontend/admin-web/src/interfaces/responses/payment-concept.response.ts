/**
 * Type: Response
 * Description: Represents a payment concept within the school's financial system, containing details about the concept's name, description, amount, and other relevant information.
 */
export interface PaymentConceptResponse {
    /**
     * Payment concept unique identifier
     */
    id: string;
    /**
     * Name of the payment concept
     */
    name: string;
    /**
     * Code of payment concept
     */
    code: string;
    /**
     * Description of the payment concept
     */
    description: string;
    /**
     * Indicates if the payment concept allows forgiveness
     */
    allowForgiveness: boolean;
    /**
     * Amount associated with the payment concept
     */
    amount: number;
    /**
     * Payment concept is active flag
     */
    isActive: boolean;
}
