/**
 * Type: Request
 * Interface to use it as a request for a login in the app
 */
export interface AuthRequest {
  /**
   * Email address or enrollment to validate login
   */
  username: string;
  /**
   * Password to validate login
   */
  password: string;
}
