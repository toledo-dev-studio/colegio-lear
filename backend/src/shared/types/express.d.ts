/**
 * Augments the Express Request interface to include the authenticated user's
 * JWT payload and resolved permissions. Both are attached by the authenticate
 * middleware after successfully verifying the access token.
 */
declare namespace Express {
  interface Request {
    user?: {
      employeeId: string;
      email: string;
      securityRoleId: string;
      /** Resolved permissions for the employee's security role. Loaded once at
       * authentication time so that authorize() checks are in-memory only. */
      permissions: Array<{
        moduleKey: string;
        canRead: boolean;
        canWrite: boolean;
        canDelete: boolean;
      }>;
    };
  }
}
