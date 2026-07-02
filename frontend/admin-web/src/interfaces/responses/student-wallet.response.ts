import type { StudentWalletItemResponse } from "./student-wallet-item.response";
import type { StudentWalletSummaryResponse } from "./student-wallet-summary.response";

/**
 * Type: Response
 * Description: Represents a payment concept associated with a student's wallet for a specific academic cycle, containing details about the payment, its status, and references to related entities.
 */
export interface StudentWalletResponse {
    /**
     * Student wallet summary
     */
    summary: StudentWalletSummaryResponse;
    /**
     * List of payment concepts associated with the student's wallet for a specific academic cycle, containing details about each payment, its status, and references to related entities.
     */
    items: StudentWalletItemResponse[];
}
