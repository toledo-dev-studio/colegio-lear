/**
 * Type: Response
 * Description: Represents a backend error response envelope.
 */
export interface ErrorResponse {
    /**
     * Human-readable error message returned by the backend
     */
    message: string;
    /**
     * Detailed error information returned by the backend (may be empty)
     */
    details: string;
}
