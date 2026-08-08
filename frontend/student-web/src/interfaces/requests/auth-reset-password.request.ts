/**
 * Type: Request
 * Description: Interface to confirm reset password when user forgot it
 */
export interface AuthResetPasswordRequest {
    /**
     * Logged in user unique identifier
     */
    id: string;
    /**
     * One time code for validate reset password
     */
    code: string;
    /**
     * New password
     */
    password: string;
    /**
     * Confirm new password
     */
    confirmPassword: string;
}