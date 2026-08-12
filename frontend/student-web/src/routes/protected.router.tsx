import { useAuthStore } from "@/stores/auth-store/auth.store";
import { type PropsWithChildren } from "react";
import { Navigate } from "react-router";

/**
 * Validate if a user is authenticated, if not return to login page.
 * @param param Children content for view.
 * @returns Children, null or redirect view depending auth status.
 */
export const AuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { authStatus, user } = useAuthStore();

  if (authStatus === "checking") return null;

  if (authStatus === "not-authenticated") return <Navigate to="/auth/login" />;

  // If user is authenticated but the password were reset before login
  if (authStatus === "authenticated" && user?.mustChangePassword === true)
    return <Navigate to="/auth/reset-password" />;

  // If user is authenticated but is not active or does not have any enrollment to an academic cycle, show the forbidden page
  if (
    (authStatus === "authenticated" && user?.isActive === false) ||
    !user?.enrollments.length
  )
    return <Navigate to="/forbidden" />;

  return children;
};

/**
 * Validate if a user is already authenticated and tries to access to any to auth page.
 * @param param Children content for view.
 * @returns Children, null or redirect view depending auth status.
 */
export const NotAuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { authStatus } = useAuthStore();

  if (authStatus === "checking") return null;

  if (authStatus === "authenticated") return <Navigate to="/" />;

  return children;
};

/**
 * Show the ForbiddenPage when the student is not active.
 * @param param Children content for view.
 * @returns Children or redirect view depending the student is active.
 */
export const ForbiddenRoute = ({ children }: PropsWithChildren) => {
  const { user, authStatus } = useAuthStore();

  // If user is authenticated but is not active or does not have any enrollment to an academic cycle, show the forbidden page
  if (
    (authStatus === "authenticated" && user?.isActive === false) ||
    !user?.enrollments.length
  )
    return children;

  return <Navigate to="/dashboard" />;
};

/**
 * Validate if a user has pending reset password.
 * @param param Children content for view.
 * @returns Children, null or redirect view depending user permissions.
 */
export const PendingResetPasswordRoute = ({ children }: PropsWithChildren) => {
  const { authStatus, user } = useAuthStore();

  // If user is authenticated but the password were reset before login
  if (authStatus === "authenticated" && user?.mustChangePassword === true)
    return children;

  return <Navigate to="/dashboard" />;
};
