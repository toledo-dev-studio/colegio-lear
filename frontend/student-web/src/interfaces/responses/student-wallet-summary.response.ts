/**
 * Type: Response
 * Description: Summary response about student wallet
 */
export interface StudentWalletSummaryResponse {
    /**
     * Represents the total summary about student wallet
     */
    total: number;
    /**
     * Represents the outstanding summary about student wallet
     */
    outstanding: number;
    /**
     * Represents the paid summary about student wallet
     */
    paid: number;
    /**
     * Represents the overdue summary about student wallet
     */
    overdue: number;
}
