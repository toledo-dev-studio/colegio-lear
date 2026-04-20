/**
 * Augments the Express Request interface to include the authenticated user's
 * JWT payload. The `user` property is attached by the auth middleware after
 * successfully verifying the access token.
 */
declare namespace Express {
  interface Request {
    user?: {
      employeeId: number;
      email: string;
      profileId: number | null;
    };
  }
}
