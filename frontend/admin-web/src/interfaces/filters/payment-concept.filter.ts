/**
 * Type: Filter
 * Description: Represents a payment concept within the school's financial system, containing details about the concept's name, description, amount, and other relevant information.
 */
export interface PaymentConceptFilter {
    /**
     * Name of the payment concept
     */
    name?: string;
    /**
     * Indicates if the payment concept allows forgiveness
     */
    allowForgiveness?: boolean;
    /**
     * Amount associated with the payment concept
     */
    amount?: number;
    /**
     * Payment concept is active flag
     */
    isActive?: boolean;
}
