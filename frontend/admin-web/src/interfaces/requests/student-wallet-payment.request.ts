import type { PaymentMethodKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Request
 * Description: Represents a payment made by a student towards their wallet for a specific academic cycle, containing details about the payment amount, related entities, and references to the associated payment concept.
 * Each student wallet payment is associated with a specific academic cycle, student, and student wallet payment concept, allowing for tracking payments made by students towards their outstanding balances for each academic cycle.
 */
export interface StudentWalletPaymentRequest {
    /**
     * Amount of the payment
     */
    amount: number;
    /**
     * Payment method used for the payment
     * Example: "Online payment", "Cash"
     */
    paymentMethod: PaymentMethodKey;
    /**
     * Identifier of the associated student wallet payment concept
     */
    studentWalletItemId: string;
}
