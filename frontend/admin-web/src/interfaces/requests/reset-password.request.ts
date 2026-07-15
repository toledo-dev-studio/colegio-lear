/**
 * Type: Request
 * Description: Interface to confirm reset password when user forgot it
 */
export interface ResetPasswordRequest {
    code: string;
    password: string;
    confirmPassword: string;
}