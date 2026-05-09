/**
 * TypeScript interfaces for the auth module.
 * These types define the shape of data flowing through the auth service layer.
 */

/** Input for employee login */
export interface LoginInput {
  email: string;
  password: string;
}

/** Input for refreshing tokens */
export interface RefreshInput {
  refreshToken: string;
}

/** JWT access token payload structure */
export interface JwtPayload {
  employeeId: number;
  email: string;
  profileId: number | null;
}

/** Input for assigning a profile to an employee */
export interface AssignProfileInput {
  employeeId: number;
  profileId: number;
}

/** Pair of access and refresh tokens returned after login or refresh */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
