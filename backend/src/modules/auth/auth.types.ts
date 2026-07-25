/**
 * JWT payload data stored in the access token.
 * Contains the minimum employee information needed for authorization.
 */
export interface JwtPayloadData {
  employeeId: string;
  email: string;
  securityRoleId: string;
}

/**
 * Permission view for a single module within a security role.
 * Represents the read/write/delete capabilities for a specific module key.
 */
export interface SecurityRolePermissionView {
  moduleKey: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

/**
 * Login response shape — employee data without password.
 * Includes nested security role with permissions and job title information.
 */
export interface LoginResponse {
  id: string;
  name: string;
  firstLastName: string;
  secondLastName: string | null;
  phoneNumber: string;
  email: string;
  username: string;
  avatar: string | null;
  mustChangePassword: boolean;
  securityRole: {
    id: string;
    name: string;
    permissions: SecurityRolePermissionView[];
  };
  jobTitle: {
    id: string;
    name: string;
    jobTitleType: string;
  };
}

/**
 * Result returned by AuthService.login.
 * Contains the signed JWT token and the employee data for the response body.
 */
export interface LoginResult {
  token: string;
  employee: LoginResponse;
}

/**
 * Cookie configuration options for the access_token cookie.
 * Controls security properties of the HttpOnly cookie used to transport the JWT.
 */
export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}
